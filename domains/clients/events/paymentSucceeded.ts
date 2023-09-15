import { StripeEventParams } from "@/types/StripeEventParams";

const paymentSucceededEvent = {
  name: "paymentSucceeded",
  emailTemplateId: "d-fee4c2f687e54d9e97b5068673742efd",
  triggerConditions: ({ stripeEventType }: StripeEventParams) =>
    stripeEventType === "invoice.payment_succeeded",
};

export default paymentSucceededEvent;
