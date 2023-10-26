import { StripeEventParams } from "@/types/StripeEventParams";

export const triggerConditions = ({
  stripeEventType,
  stripeEventPreviousAttributes,
}: StripeEventParams) =>
  stripeEventType === "customer.subscription.updated" &&
  (stripeEventPreviousAttributes?.plan?.amount ||
    stripeEventPreviousAttributes?.plan?.currency) &&
  !stripeEventPreviousAttributes.cancel_at_period_end;

const pricingChangedEvent = {
  emailTemplateId: "d-776524b90fc34aa387b8337205142e8c",
  triggerConditions: ({
    stripeEventType,
    stripeEventPreviousAttributes,
  }: StripeEventParams) =>
    stripeEventType === "customer.subscription.updated" &&
    (stripeEventPreviousAttributes?.plan?.amount ||
      stripeEventPreviousAttributes?.plan?.currency) &&
    !stripeEventPreviousAttributes.cancel_at_period_end,
};

export default pricingChangedEvent;
