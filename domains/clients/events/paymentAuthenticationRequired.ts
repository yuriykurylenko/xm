import { StripeEventParams } from "@/types/StripeEventParams";

export const triggerConditions = ({
  stripeEventType,
  stripeInvoice,
  stripeCharge,
}: StripeEventParams) =>
  stripeEventType === "invoice.payment_failed" &&
  stripeInvoice.billing_reason !== "subscription_create" &&
  stripeCharge &&
  stripeCharge.failure_code === "authentication_required";

const paymentAuthenticationRequiredEvent = {
  emailTemplateId: "d-f467666dc085418ba8904d165d5f5a2b",
  triggerConditions: ({
    stripeEventType,
    stripeInvoice,
    stripeCharge,
  }: StripeEventParams) =>
    stripeEventType === "invoice.payment_failed" &&
    stripeInvoice.billing_reason !== "subscription_create" &&
    stripeCharge &&
    stripeCharge.failure_code === "authentication_required",
};

export default paymentAuthenticationRequiredEvent;
