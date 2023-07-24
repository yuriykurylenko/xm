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
      const charge = await stripe.charges.retrieve(invoice.charge as string);

      if (!charge) {
        return res.json({ received: true });
      }

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
        status: invoice.status as string,
        failure_code: charge?.failure_code as string | undefined,
        failure_message: charge?.failure_message as string | undefined,
        hosted_invoice_url: invoice.hosted_invoice_url as string,
        invoice_pdf: invoice.invoice_pdf as string,
        receipt_url: charge.receipt_url as string,
      };

      await createPayment(payment);

      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

      const receiptHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${payment.receipt_url}">Receipt</a></div>`;

      const invoiceHtml = `<div style="margin: 20px 0;"><a style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;" href="${payment.invoice_pdf}">Invoice</a></div>`;

      const msg = {
        to: client?.email,
        from: "yuriy.kurylenko@gmail.com",
        subject: `Payment ${payment.status}`,
        text: `Coaching subscription payment with ${coach?.full_name}\n\nDear ${
          client?.full_name
        },\n\nYour recent payment for a subscription with ${
          coach?.full_name
        } has ${payment.status}. Please find the details below:\n\nAmount: ${
          payment.amount_paid / 100
        } ${payment.currency}\nInvoice: ${payment.invoice_pdf}\nReceipt: ${
          payment.receipt_url
        }\n\nThank you,\n${coach?.full_name}`,
        html: `<h2>Coaching subscription payment with ${
          coach?.full_name
        }</h2><div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;"><p>Dear ${
          client?.full_name
        },</p><p>Your recent payment for a subscription with ${
          coach?.full_name
        } has ${payment.status}. Please find the details below:</p><p>Amount: ${
          payment.amount_paid / 100
        } ${payment.currency}</p>${payment.invoice_pdf && invoiceHtml}${
          payment.receipt_url && receiptHtml
        }<p>Thank you,</p><p>${coach?.full_name}</p></div>`,
      };

      console.log(msg)

      const mailRes = await sgMail.send(msg);
      console.log(mailRes);

      res.json({ received: true, invoice, charge, subscription });
    } else {
      res.json({ received: true });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
