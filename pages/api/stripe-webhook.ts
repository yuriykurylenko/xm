import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import {
  fetchClientById,
  fetchCoachByClientId,
  fetchSubscriptionById,
} from "@/app/utils/api";
import sgMail from "@sendgrid/mail";
import { Subscription } from "@/app/types/subscription";
import { Client, Coach } from "@/app/types/user";

import events from "@/app/utils/clientEvents";
import triggerEvent from "@/app/utils/triggerEvent";

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

    let stripeEvent: Stripe.Event;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    try {
      stripeEvent = stripe.webhooks.constructEvent(
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

    const eventObject = stripeEvent.data.object as any;
    const previousAttributes = stripeEvent.data.previous_attributes as any;

    const stripeSubscription = [
      "subscription",
      "subscriptionSchedule",
    ].includes(eventObject.object)
      ? eventObject
      : await stripe.subscriptions.retrieve(eventObject.subscription);

    const stripeInvoice =
      eventObject.object === "invoice"
        ? eventObject
        : eventObject.latest_invoice
        ? await stripe.invoices.retrieve(eventObject.latest_invoice)
        : null;

    const stripeCharge =
      eventObject.object === "invoice"
        ? eventObject.charge &&
          (await stripe.charges.retrieve(eventObject.charge as string))
        : null;

    const clientSubscription =
      stripeSubscription &&
      (await fetchSubscriptionById(stripeSubscription.metadata.subscription_id))
        ?.data;

    const { data: client } = await fetchClientById(
      clientSubscription?.client_id
    );
    const { data: coach } = await fetchCoachByClientId(
      clientSubscription?.client_id
    );

    if (clientSubscription && client && coach) {
      const eventData = {
        stripeSubscriptionId: stripeSubscription.id,
        stripe_subscription_id: stripeSubscription.id,
        status: stripeSubscription.status,
        start_date: new Date(stripeSubscription.start_date * 1000),
        end_date: stripeSubscription.canceled_at
          ? new Date((stripeSubscription.canceled_at as number) * 1000)
          : stripeSubscription.cancel_at_period_end &&
            stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
        current_period_end_date: new Date(
          stripeSubscription.current_period_end * 1000
        ),
        invoice_number: stripeInvoice.number,
        amount: (stripeInvoice.amount_paid || stripeInvoice.amount_due) / 100,
        currency: stripeInvoice.currency.toUpperCase(),
        hosted_invoice_url: stripeInvoice.hosted_invoice_url,
      };

      for (const event of events) {
        if (
          event.triggerConditions({
            stripeEventType: stripeEvent.type,
            stripeEventPreviousAttributes: previousAttributes,
            stripeSubscription,
            stripeInvoice,
            stripeCharge,
            subscription: clientSubscription as Subscription,
            client: client as Client,
          })
        ) {
          await triggerEvent(
            event.name,
            {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            },
            eventData
          );
        }
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
