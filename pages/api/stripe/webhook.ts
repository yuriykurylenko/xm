import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/initializers/stripe";
import { buffer } from "micro";
import { fetchSubscriptionById } from "@/app/utils/api";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

import triggerEvent from "@/app/utils/triggerEvent";

const events = [
  "clients.platformAccessGranted",
  "clients.platformAccessRestored",
  "clients.pricingChanged",
  "clients.startCanceled",
  "clients.started",
  "clients.startScheduled",
  "clients.subscriptionAutoRenewed",
  "clients.subscriptionCancellationScheduled",
  "clients.subscriptionCancelled",
  "clients.subscriptionRenewed",
  "clients.termsChanged",
  "clients.paymentAuthenticationRequired",
  "clients.paymentFailed",
  "clients.paymentSucceeded",
];

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
      "subscription_schedule",
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
        client_name: client.full_name,
        coach_name: coach.full_name,
        subscription_id: clientSubscription?.id,
        stripe_subscription_id: stripeSubscription.id,
        status: stripeSubscription.status,
        start_date: stripeSubscription.start_date
          ? new Date(stripeSubscription.start_date * 1000)
          : !clientSubscription?.start_date ||
            new Date(clientSubscription.start_date) < new Date()
          ? new Date()
          : new Date(clientSubscription.start_date),
        end_date:
          stripeSubscription.cancel_at_period_end &&
          stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : stripeSubscription.canceled_at
            ? new Date((stripeSubscription.canceled_at as number) * 1000)
            : null,
        current_period_end_date:
          stripeSubscription.current_period_end &&
          new Date(stripeSubscription.current_period_end * 1000),
        new_price_start_date:
          clientSubscription.current_period_end_date &&
          new Date(clientSubscription.current_period_end_date),
        invoice_number: stripeInvoice?.number,
        amount:
          eventObject.object === "invoice" && stripeInvoice
            ? (stripeInvoice.amount_paid || stripeInvoice.amount_due) / 100
            : clientSubscription.monthly_amount / 100,
        currency:
          stripeInvoice?.currency?.toUpperCase() || clientSubscription.currency,
        trial_period_days: clientSubscription?.trial_period_days,
        hosted_invoice_url: stripeInvoice?.hosted_invoice_url,
        notification_email: client?.email,
      };

      const eventContext = {
        stripeEventType: stripeEvent.type,
        stripeEventPreviousAttributes: previousAttributes,
        stripeSubscription,
        stripeInvoice,
        stripeCharge,
        subscription: clientSubscription as Subscription,
        client: client as Client,
      };

      try {
        for (const event of events) {
          await triggerEvent(
            event,
            {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            },
            eventData,
            eventContext
          );
        }
      } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Failed to trigger events" });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
