import Stripe from "stripe";

import { Subscription } from "@/app/types/subscription";
import { Client, Coach } from "@/app/types/user";

import {
  updateClientSubscriptionById,
  updateClientById,
  updateSubscriptionById,
} from "@/app/utils/api";

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

export default events;
