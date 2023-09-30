import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { current_period_end_date }: { current_period_end_date: Date | null }
) =>
  updateSubscriptionById(subscription.id, {
    current_period_end_date:
      current_period_end_date && new Date(current_period_end_date),
  });

const subscriptionAutoRenewedEvent = {
  handler,
  triggerConditions: ({ stripeEventType }: StripeEventParams) =>
    stripeEventType === "invoice.created",
};

export default subscriptionAutoRenewedEvent;
