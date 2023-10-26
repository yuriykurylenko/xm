import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

export const handler = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date }
) => updateSubscriptionById(subscription.id, { status, end_date });

export const triggerConditions = ({
  stripeEventType,
  stripeSubscription,
}: StripeEventParams) =>
  stripeEventType === "customer.subscription.updated" &&
  stripeSubscription.current_period_end &&
  stripeSubscription.cancel_at_period_end;

const subscriptionCancellationScheduledEvent = {
  handler,
  triggerConditions: ({
    stripeEventType,
    stripeSubscription,
  }: StripeEventParams) =>
    stripeEventType === "customer.subscription.updated" &&
    stripeSubscription.current_period_end &&
    stripeSubscription.cancel_at_period_end,
};

export default subscriptionCancellationScheduledEvent;
