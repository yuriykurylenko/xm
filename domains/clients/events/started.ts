import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { update as updateClientById } from "@/domains/clients/model";

import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

export const handler = async (
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
  await updateSubscriptionById(subscription?.id, {
    stripe_subscription_id,
    status,
    start_date,
    current_period_end_date,
  });

  await updateClientById(client.id, {
    status: "client",
    access_revoked_at: null,
  });
};

export const triggerConditions = ({
  stripeEventType,
  stripeEventPreviousAttributes,
  stripeSubscription,
}: StripeEventParams) =>
  ["active", "trialing"].includes(stripeSubscription.status) &&
  (stripeEventType === "customer.subscription.created" ||
    (stripeEventType === "customer.subscription.updated" &&
      stripeEventPreviousAttributes?.status));
