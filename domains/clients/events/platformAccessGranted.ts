import { StripeEventParams } from "@/types/StripeEventParams";

export const triggerConditions = ({
  stripeEventType,
  stripeEventPreviousAttributes,
  stripeSubscription,
  client,
}: StripeEventParams) =>
  ["active", "trialing"].includes(stripeSubscription.status) &&
  !client.user_id &&
  (stripeEventType === "customer.subscription.created" ||
    (stripeEventType === "customer.subscription.updated" &&
      stripeEventPreviousAttributes?.status));
