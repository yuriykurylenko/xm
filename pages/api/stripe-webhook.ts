import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import { Payment } from "@/app/types/subscription";
import {
  createPayment,
  fetchClientById,
  fetchCoachByClientId,
  fetchSubscriptionByStripeSubscriptionId,
} from "@/app/utils/api";

import sgMail from "@sendgrid/mail";

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
      const invoice = event.data.object as Stripe.Invoice;

      if (!invoice.charge) {
        return res.json({ received: true });
      }

      const charge = await stripe.charges.retrieve(invoice.charge as string);

      const { data: subscription } =
        await fetchSubscriptionByStripeSubscriptionId(
          invoice.subscription as string
        );

      const { data: client, error: clientError } = await fetchClientById(
        subscription?.client_id
      );
      const { data: coach, error: coachError } = await fetchCoachByClientId(
        subscription?.client_id
      );

      const payment: Payment = {
        subscription_id: subscription?.id,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent as string,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status:
          event.type === "invoice.payment_failed"
            ? "failed"
            : event.type === "invoice.payment_succeeded"
            ? "paid"
            : "unknown",
        failure_code: charge?.failure_code as string | undefined,
        failure_message: charge?.failure_message as string | undefined,
        hosted_invoice_url: invoice.hosted_invoice_url as string,
        invoice_pdf: invoice.invoice_pdf as string,
        receipt_url: charge.receipt_url as string,
      };

      await createPayment(payment);

      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

      const invoiceHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${payment.invoice_pdf}">Invoice</a></div>`;
      const invoiceText = `Invoice: ${payment.invoice_pdf}`;

      const receiptHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${payment.receipt_url}">Receipt</a></div>`;
      const receiptText = `Receipt: ${payment.receipt_url}`;

      const confirmHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${payment.hosted_invoice_url}">Confirm</a></div>`;
      const confirmText = `Confirm: ${payment.hosted_invoice_url}`;

      let emailSubject;
      let emailHtml;
      let emailText;

      if (event.type === "invoice.payment_succeeded") {
        emailSubject = `${coach?.full_name} - Invoice ${payment.stripe_invoice_id} paid`;

        emailHtml = `<div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;"><p>Dear ${
          client?.full_name
        },</p><p>Your recent invoice for a subscription with ${
          coach?.full_name
        } has been paid. Please find the details below:</p><p>Amount: ${
          (payment.amount_paid || payment.amount_due) / 100
        } ${payment.currency}</p>${payment.invoice_pdf && invoiceHtml}${
          payment.receipt_url ? receiptHtml : ""
        }<p>Thank you,</p><p>${coach?.full_name}</p></div>`;

        emailText = `Dear ${
          client?.full_name
        },\n\nYour recent invoice for a subscription with ${
          coach?.full_name
        } has been paid. Please find the details below:\n\nAmount: ${
          (payment.amount_paid || payment.amount_due) / 100
        } ${payment.currency}\n${payment.invoice_pdf ? invoiceText : ""}\n${
          payment.receipt_url ? receiptText : ""
        }\n\nThank you,\n${coach?.full_name}`;
      } else if (payment.failure_code === "authentication_required") {
        emailSubject = `${coach?.full_name} - Authentication required for your subscription payment`;

        emailHtml = `<div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;"><p>Dear ${
          client?.full_name
        },</p><p>Authentication required to collect your payment for subscription with ${
          coach?.full_name
        }.</p><p>Amount: ${(payment.amount_paid || payment.amount_due) / 100} ${
          payment.currency
        }</p>${confirmHtml}<p>Thank you,</p><p>${coach?.full_name}</p></div>`;

        emailText = `Dear ${
          client?.full_name
        },\nAuthentication required to collect your payment for subscription with ${
          coach?.full_name
        }.\nAmount: ${(payment.amount_paid || payment.amount_due) / 100} ${
          payment.currency
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
          (payment.amount_paid || payment.amount_due) / 100
        } ${payment.currency}</p>${
          payment.invoice_pdf ? invoiceHtml : ""
        }<p>Thank you,</p><p>${coach?.full_name}</p></div>`;

        emailText = `Dear ${
          client?.full_name
        },\n\nWe failed to collect your payment for subscription with ${
          coach?.full_name
        }. Please find the details below:\n\nAmount: ${
          (payment.amount_paid || payment.amount_due) / 100
        } ${payment.currency}\n${
          payment.invoice_pdf ? invoiceText : ""
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
