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
