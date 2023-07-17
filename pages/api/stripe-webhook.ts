import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from 'micro';

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

    let payment

    switch (event.type) {
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        payment = event.data.object as Stripe.Invoice;
        // Update your data here
        break;
      // Handle other event types as needed
      default:
        return res.status(400).end();
    }

    res.json({ received: true, payment: payment });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
