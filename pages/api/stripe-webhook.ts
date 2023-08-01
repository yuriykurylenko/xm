import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import {
  fetchSubscriptionByStripeSubscriptionId,
  fetchClientById,
  fetchCoachByClientId,
  updateClientSubscriptionByStripeSubscriptionId,
  updateClientSubscriptionById,
  updateClientById,
} from "@/app/utils/api";
import sgMail from "@sendgrid/mail";
import { UUID } from "crypto";
import { Subscription, SubscriptionInput } from "@/app/types/subscription";

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
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

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

    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;

      if (subscription.metadata.subscription_id) {
        const { data: clientSubscription } = await updateClientSubscriptionById(
          subscription.metadata.subscription_id as UUID,
          {
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            start_date: new Date(subscription.start_date * 1000),
          }
        );

        if (clientSubscription) {
          if (["active", "trialing"].includes(clientSubscription.status)) {
            await updateClientById(clientSubscription.client_id, {
              status: "client",
            });
          }

          const { data: client } = await fetchClientById(
            clientSubscription?.client_id
          );
          const { data: coach } = await fetchCoachByClientId(
            clientSubscription.client_id
          );

          if (coach && client) {
            await sgMail.send({
              to: client.email,
              from: "yuriy.kurylenko@gmail.com",
              templateId: "d-bb7a32cfdef545308aea0cf7bbbee901",
              dynamicTemplateData: {
                client_name: client.full_name,
                coach_name: coach.full_name,
                subscription_id: clientSubscription.id,
              },
            });
          }
        }
      }

      res.json({ received: true });
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const subscriptionUpdateProps: SubscriptionInput = {
        status: subscription.status,
      };

      if (
        event.type === "customer.subscription.deleted" &&
        subscription.canceled_at
      ) {
        subscriptionUpdateProps.end_date = new Date(
          subscription.canceled_at * 1000
        );
      }

      const { data: clientSubscription } =
        await updateClientSubscriptionByStripeSubscriptionId(
          subscription.id,
          subscriptionUpdateProps
        );

      if (clientSubscription && subscription.status === "canceled") {
        await updateClientById(clientSubscription.client_id, {
          status: "ended",
        });
      }

      res.json({ received: true });
    } else if (
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

      const { data: client } = await fetchClientById(subscription?.client_id);
      const { data: coach } = await fetchCoachByClientId(
        subscription?.client_id
      );

      await sgMail.send({
        to: client?.email,
        from: "yuriy.kurylenko@gmail.com",
        templateId:
          event.type === "invoice.payment_succeeded"
            ? "d-fee4c2f687e54d9e97b5068673742efd"
            : stripeCharge.failure_code === "authentication_required"
            ? "d-f467666dc085418ba8904d165d5f5a2b"
            : "d-5e885ef0588e46b8b976eeaece239819",
        dynamicTemplateData: {
          client_name: client?.full_name,
          coach_name: coach?.full_name,
          invoice_number: stripeInvoice.number,
          amount: (stripeInvoice.amount_paid || stripeInvoice.amount_due) / 100,
          currency: stripeInvoice.currency.toUpperCase(),
          hosted_invoice_url: stripeInvoice.hosted_invoice_url,
        },
      });

      res.json({ received: true });
    } else {
      res.json({ received: true });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
