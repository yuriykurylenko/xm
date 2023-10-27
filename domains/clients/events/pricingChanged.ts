import { StripeEventParams } from "@/types/StripeEventParams";

export const triggerConditions = ({
  stripeEventType,
  stripeEventPreviousAttributes,
}: StripeEventParams) =>
  stripeEventType === "customer.subscription.updated" &&
  (stripeEventPreviousAttributes?.plan?.amount ||
    stripeEventPreviousAttributes?.plan?.currency) &&
  !stripeEventPreviousAttributes.cancel_at_period_end;
