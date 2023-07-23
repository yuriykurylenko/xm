import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import { Payment } from "@/app/types/subscription";
import {
  createPayment,
  fetchSubscriptionByStripeSubscriptionId,
} from "@/app/utils/api";

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
      const { data: subscription } =
        await fetchSubscriptionByStripeSubscriptionId(
          invoice.subscription as string
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
      };

      await createPayment(payment);
      res.json({ received: true, invoice, charge, subscription });
    } else {
      res.json({ received: true });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
