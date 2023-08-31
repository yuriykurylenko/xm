import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import {
  fetchClientById,
  fetchCoachByClientId,
  updateClientSubscriptionById,
  updateClientById,
  fetchSubscriptionById,
  updateSubscriptionById,
} from "@/app/utils/api";
import sgMail from "@sendgrid/mail";
import { Subscription } from "@/app/types/subscription";
import { Client, Coach } from "@/app/types/user";
import { format } from "date-fns";

export const config = {
  api: {
    bodyParser: false,
  },
};

type StripeEventParams = {
  stripeEventType: string;
  stripeEventPreviousAttributes: any;
  stripeSubscription: Stripe.Subscription;
  stripeInvoice: Stripe.Invoice;
  stripeCharge?: Stripe.Charge;
  subscription: Subscription;
  client: Client;
};

const onClientStartScheduled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripeSubscriptionId }: { stripeSubscriptionId: string }
) => {
  await updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id: stripeSubscriptionId,
  });

  await updateClientById(client.id, {
    status: "starting",
  });
};

const onClientTermsChanged = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripeSubscriptionId }: { stripeSubscriptionId: string }
) =>
  updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id: stripeSubscriptionId,
  });

const onClientStartCanceled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) => {
  await updateClientSubscriptionById(subscription.id, {
    start_date: null,
    end_date: null,
    archived_at: new Date(),
  });

  await updateClientById(client.id, {
    status: "lead",
    subscription_status: null,
    start_date: null,
    end_date: null,
  });
};

const onClientStarted = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  {
    start_date,
    current_period_end_date,
    stripe_subscription_id,
    status,
  }: {
    start_date: Date;
    current_period_end_date: Date;
    stripe_subscription_id: string;
    status: string;
  }
) => {
  const { data: updatedSubscription } = await updateClientSubscriptionById(
    subscription?.id,
    {
      stripe_subscription_id,
      status,
      start_date,
      current_period_end_date,
    }
  );

  if (["active", "trialing"].includes(status)) {
    await updateClientById(client.id, {
      status: "client",
      access_revoked_at: null,
    });
  }
};

const onClientSubscriptionCancellationScheduled = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date }
) => updateSubscriptionById(subscription.id, { status, end_date });

const onClientSubscriptionRenewed = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => updateClientSubscriptionById(subscription.id, { status, end_date });

const onClientSubscriptionAutoRenewed = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { current_period_end_date }: { current_period_end_date: Date | null }
) =>
  updateClientSubscriptionById(subscription.id, {
    current_period_end_date:
      current_period_end_date && new Date(current_period_end_date),
  });

const onClientSubscriptionCancelled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => {
  await updateClientSubscriptionById(subscription.id, {
    status,
    end_date,
  });

  await updateClientById(subscription.client_id, {
    status: "ended",
    access_revoked_at: !subscription.access_after_end_date ? new Date() : null,
  });
};

const events = [
  {
    name: "clientStartScheduled",
    handler: onClientStartScheduled,
    triggerConditions: ({
      stripeEventType,
      stripeSubscription,
    }: StripeEventParams) =>
      stripeEventType === "subscription_schedule.created" &&
      !stripeSubscription.metadata?.updated,
  },
  {
    name: "clientTermsChanged",
    handler: onClientTermsChanged,
    emailTemplateId: "d-306b9c3260cd4337b3528ee2e847bb31",
    triggerConditions: ({
      stripeEventType,
      stripeSubscription,
    }: StripeEventParams) =>
      stripeEventType === "subscription_schedule.created" &&
      stripeSubscription.metadata?.updated,
  },
  {
    name: "clientStartCanceled",
    handler: onClientStartCanceled,
    triggerConditions: ({ stripeEventType, subscription }: StripeEventParams) =>
      stripeEventType === "subscription_schedule.canceled" &&
      !subscription.archived_at &&
      subscription.start_date &&
      new Date(subscription.start_date) >= new Date(),
  },
  {
    name: "clientStarted",
    handler: onClientStarted,
    triggerConditions: ({
      stripeEventType,
      stripeEventPreviousAttributes,
      stripeSubscription,
    }: StripeEventParams) =>
      stripeSubscription.status === "active" &&
      (stripeEventType === "customer.subscription.created" ||
        (stripeEventType === "customer.subscription.updated" &&
          stripeEventPreviousAttributes?.status)),
  },
  {
    name: "clientPlatformAccessGranted",
    emailTemplateId: "d-bb7a32cfdef545308aea0cf7bbbee901",
    triggerConditions: ({
      stripeEventType,
      stripeEventPreviousAttributes,
      stripeSubscription,
      client,
    }: StripeEventParams) =>
      stripeSubscription.status === "active" &&
      !client.user_id &&
      (stripeEventType === "customer.subscription.created" ||
        (stripeEventType === "customer.subscription.updated" &&
          stripeEventPreviousAttributes?.status)),
  },
  {
    name: "clientPlatformAccessRestored",
    emailTemplateId: "d-f33881ff79f24f07a10820b49bdc1713",
    triggerConditions: ({
      stripeEventType,
      stripeEventPreviousAttributes,
      stripeSubscription,
      client,
    }: StripeEventParams) =>
      stripeSubscription.status === "active" &&
      client.user_id &&
      (stripeEventType === "customer.subscription.created" ||
        (stripeEventType === "customer.subscription.updated" &&
          stripeEventPreviousAttributes?.status)),
  },
  {
    name: "clientSubscriptionCancellationScheduled",
    handler: onClientSubscriptionCancellationScheduled,
    triggerConditions: ({
      stripeEventType,
      stripeSubscription,
    }: StripeEventParams) =>
      stripeEventType === "customer.subscription.updated" &&
      stripeSubscription.current_period_end &&
      stripeSubscription.cancel_at_period_end,
  },
  {
    name: "clientPricingChanged",
    emailTemplateId: "d-776524b90fc34aa387b8337205142e8c",
    triggerConditions: ({
      stripeEventType,
      stripeEventPreviousAttributes,
    }: StripeEventParams) =>
      stripeEventType === "customer.subscription.updated" &&
      (stripeEventPreviousAttributes?.plan?.amount ||
        stripeEventPreviousAttributes?.plan?.currency) &&
      !stripeEventPreviousAttributes.cancel_at_period_end,
  },
  {
    name: "clientSubscriptionRenewed",
    handler: onClientSubscriptionRenewed,
    emailTemplateId: "d-664503562b62462d9931a694b35c5155",
    triggerConditions: ({
      stripeEventType,
      stripeEventPreviousAttributes,
    }: StripeEventParams) =>
      stripeEventType === "customer.subscription.updated" &&
      stripeEventPreviousAttributes.cancel_at_period_end,
  },
  {
    name: "clientSubscriptionAutoRenewed",
    handler: onClientSubscriptionAutoRenewed,
    triggerConditions: ({ stripeEventType }: StripeEventParams) =>
      stripeEventType === "invoice.created",
  },
  {
    name: "clientSubscriptionCancelled",
    handler: onClientSubscriptionCancelled,
    triggerConditions: ({ stripeEventType }: StripeEventParams) =>
      stripeEventType === "customer.subscription.deleted",
  },
  {
    name: "paymentSucceeded",
    emailTemplateId: "d-fee4c2f687e54d9e97b5068673742efd",
    triggerConditions: ({ stripeEventType }: StripeEventParams) =>
      stripeEventType === "invoice.payment_succeeded",
  },
  {
    name: "paymentAuthenticationRequired",
    emailTemplateId: "d-f467666dc085418ba8904d165d5f5a2b",
    triggerConditions: ({
      stripeEventType,
      stripeInvoice,
      stripeCharge,
    }: StripeEventParams) =>
      stripeEventType === "invoice.payment_failed" &&
      stripeInvoice.billing_reason !== "subscription_create" &&
      stripeCharge &&
      stripeCharge.failure_code === "authentication_required",
  },
  {
    name: "paymentFailed",
    emailTemplateId: "d-5e885ef0588e46b8b976eeaece239819",
    triggerConditions: ({
      stripeEventType,
      stripeInvoice,
      stripeCharge,
    }: StripeEventParams) =>
      stripeEventType === "invoice.payment_failed" &&
      stripeInvoice.billing_reason !== "subscription_create" &&
      stripeCharge &&
      stripeCharge.failure_code !== "authentication_required",
  },
];

const triggerEvent = async (
  name: string,
  {
    subscription,
    client,
    coach,
  }: { subscription: Subscription; client: Client; coach: Coach },
  data?: any
) => {
  const event = events.find((e) => e.name === name);

  if (event) {
    if (event.handler) {
      await event.handler(subscription, client, coach, data);
    }

    if (event.emailTemplateId) {
      await sgMail.send({
        to: client.email,
        from: "yuriy.kurylenko@gmail.com",
        templateId: event.emailTemplateId,
        dynamicTemplateData: {
          client_name: client.full_name,
          coach_name: coach.full_name,
          subscription_id: subscription?.id,
          amount: data?.amount || subscription?.monthly_amount / 100,
          currency: data?.currency || subscription?.currency,
          trial_period_days: subscription?.trial_period_days,
          start_date: format(
            !subscription?.start_date ||
              new Date(subscription.start_date) < new Date()
              ? new Date()
              : new Date(subscription.start_date),
            "dd/MM/yyyy"
          ),
          new_price_start_date:
            subscription.current_period_end_date &&
            format(
              new Date(subscription.current_period_end_date),
              "dd/MM/yyyy"
            ),
          invoice_number: data?.invoice_number,
          hosted_invoice_url: data?.hosted_invoice_url,
        },
      });
    }
  }
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
