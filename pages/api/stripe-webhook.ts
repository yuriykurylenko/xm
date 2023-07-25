import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import { Invoice, Charge } from "@/app/types/subscription";
import {
  createInvoice,
  createCharge,
  fetchSubscriptionByStripeSubscriptionId,
  fetchClientById,
  fetchCoachByClientId,
} from "@/app/utils/api";
import sgMail from "@sendgrid/mail";
import { UUID } from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(`Webhook Error: ${err.message}`);
      } else {
        res.status(400).send(`Webhook Error: ${err}`);
      }
      return;
    }

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const stripeInvoice = event.data.object as Stripe.Invoice;

      if (!stripeInvoice.charge) {
        return res.json({ received: true });
      }

      const stripeCharge = await stripe.charges.retrieve(
        stripeInvoice.charge as string
      );

      const { data: subscription } =
        await fetchSubscriptionByStripeSubscriptionId(
          stripeInvoice.subscription as string
        );

      const { data: client, error: clientError } = await fetchClientById(
        subscription?.client_id
      );
      const { data: coach, error: coachError } = await fetchCoachByClientId(
        subscription?.client_id
      );

      const invoice: Invoice = {
        subscription_id: subscription?.id,
        stripe_invoice_id: stripeInvoice.id,
        stripe_invoice_number: stripeInvoice.number as string,
        amount_due: stripeInvoice.amount_due,
        amount_paid: stripeInvoice.amount_paid,
        currency: stripeInvoice.currency,
        due_date: stripeInvoice.due_date
          ? new Date(stripeInvoice.due_date * 1000)
          : null,
        last_charge_attempted_at: new Date(),
        invoice_pdf: stripeInvoice.invoice_pdf,
        hosted_invoice_url: stripeInvoice.hosted_invoice_url,
      };

      await createInvoice(invoice);

      const charge: Charge = {
        invoice_id: invoice.id as UUID,
        stripe_charge_id: stripeCharge.id,
        amount: stripeCharge.amount,
        amount_captured: stripeCharge.amount_captured,
        amount_refunded: stripeCharge.amount_refunded,
        currency: stripeCharge.currency,
        failure_code: stripeCharge.failure_code,
        failure_message: stripeCharge.failure_message,
        status: stripeCharge.status,
        receipt_url: stripeCharge.receipt_url,
      };

      await createCharge(charge);

      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

      const invoiceHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${invoice.invoice_pdf}">Invoice</a></div>`;
      const invoiceText = `Invoice: ${invoice.invoice_pdf}`;

      const receiptHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${charge.receipt_url}">Receipt</a></div>`;
      const receiptText = `Receipt: ${charge.receipt_url}`;

      const confirmHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${invoice.hosted_invoice_url}">Confirm</a></div>`;
      const confirmText = `Confirm: ${invoice.hosted_invoice_url}`;

      let emailSubject;
      let emailHtml;
      let emailText;

      if (event.type === "invoice.payment_succeeded") {
        emailSubject = `${coach?.full_name} - Invoice ${invoice.stripe_invoice_number} paid`;

        emailHtml = `<div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;"><p>Dear ${
          client?.full_name
        },</p><p>Your recent invoice for a subscription with ${
          coach?.full_name
        } has been paid. Please find the details below:</p><p>Amount: ${
          (invoice.amount_paid || invoice.amount_due) / 100
        } ${invoice.currency}</p>${invoice.invoice_pdf && invoiceHtml}${
          charge.receipt_url ? receiptHtml : ""
        }<p>Thank you,</p><p>${coach?.full_name}</p></div>`;

        emailText = `Dear ${
          client?.full_name
        },\n\nYour recent invoice for a subscription with ${
          coach?.full_name
        } has been paid. Please find the details below:\n\nAmount: ${
          (invoice.amount_paid || invoice.amount_due) / 100
        } ${invoice.currency}\n${invoice.invoice_pdf ? invoiceText : ""}\n${
          charge.receipt_url ? receiptText : ""
        }\n\nThank you,\n${coach?.full_name}`;
      } else if (charge.failure_code === "authentication_required") {
        emailSubject = `${coach?.full_name} - Authentication required for your subscription payment`;

        emailHtml = `<div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;"><p>Dear ${
          client?.full_name
        },</p><p>Authentication required to collect your payment for subscription with ${
          coach?.full_name
        }.</p><p>Amount: ${(invoice.amount_paid || invoice.amount_due) / 100} ${
          invoice.currency
        }</p>${confirmHtml}<p>Thank you,</p><p>${coach?.full_name}</p></div>`;

        emailText = `Dear ${
          client?.full_name
        },\nAuthentication required to collect your payment for subscription with ${
          coach?.full_name
        }.\nAmount: ${(invoice.amount_paid || invoice.amount_due) / 100} ${
          invoice.currency
        }\nPlease confirm your payment below ${confirmText}\n\nThank you,\n${
          coach?.full_name
        }`;
      } else {
        emailSubject = `${coach?.full_name} - Your subscription payment failed`;

        emailHtml = `<div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;"><p>Dear ${
          client?.full_name
        },</p><p>We failed to collect your payment for subscription with ${
          coach?.full_name
        }. Please find the details below:</p><p>Amount: ${
          (invoice.amount_paid || invoice.amount_due) / 100
        } ${invoice.currency}</p>${
          invoice.invoice_pdf ? invoiceHtml : ""
        }<p>Thank you,</p><p>${coach?.full_name}</p></div>`;

        emailText = `Dear ${
          client?.full_name
        },\n\nWe failed to collect your payment for subscription with ${
          coach?.full_name
        }. Please find the details below:\n\nAmount: ${
          (invoice.amount_paid || invoice.amount_due) / 100
        } ${invoice.currency}\n${
          invoice.invoice_pdf ? invoiceText : ""
        }\n\nThank you,\n${coach?.full_name}`;
      }

      await sgMail.send({
        to: client?.email,
        from: "yuriy.kurylenko@gmail.com",
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      res.json({ received: true, invoice, charge, subscription });
    } else {
      res.json({ received: true });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
