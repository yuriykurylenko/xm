import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

export const handler = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripe_subscription_id }: { stripe_subscription_id: string }
) =>
  updateSubscriptionById(subscription.id, {
    stripe_subscription_id,
  });

export const triggerConditions = ({
  stripeEventType,
  stripeSubscription,
}: StripeEventParams) =>
  stripeEventType === "subscription_schedule.created" &&
  stripeSubscription.metadata?.updated;
