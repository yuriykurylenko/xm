import { StripeEventParams } from "@/types/StripeEventParams";

const paymentFailedEvent = {
  name: "paymentFailed",
  emailTemplateId: "d-5e885ef0588e46b8b976eeaece239819",
  triggerConditions: ({
    stripeEventType,
    stripeInvoice,
    stripeCharge,
  }: StripeEventParams) =>
    stripeEventType === "invoice.payment_failed" &&
    stripeInvoice.billing_reason !== "subscription_create" &&
    stripeCharge &&
    stripeCharge.failure_code !== "authentication_required",
};

export default paymentFailedEvent;
