import { StripeEventParams } from "@/types/StripeEventParams";

const paymentSucceededEvent = {
  emailTemplateId: "d-fee4c2f687e54d9e97b5068673742efd",
  triggerConditions: ({ stripeEventType, stripeInvoice }: StripeEventParams) =>
    stripeEventType === "invoice.payment_succeeded" &&
    stripeInvoice.amount_paid > 0,
};

export default paymentSucceededEvent;
