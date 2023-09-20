import { StripeEventParams } from "@/types/StripeEventParams";

const platformAccessGrantedEvent = {
  name: "platformAccessGranted",
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
};

export default platformAccessGrantedEvent;
