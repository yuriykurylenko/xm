import { StripeEventParams } from "@/types/StripeEventParams";

export const triggerConditions = ({
  stripeEventType,
  stripeEventPreviousAttributes,
  stripeSubscription,
  client,
}: StripeEventParams) =>
  stripeSubscription.status === "active" &&
  client.user_id &&
  (stripeEventType === "customer.subscription.created" ||
    (stripeEventType === "customer.subscription.updated" &&
      stripeEventPreviousAttributes?.status));

const platformAccessRestoredEvent = {
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
};

export default platformAccessRestoredEvent;
