import { StripeEventParams } from "@/types/StripeEventParams";

export const triggerConditions = ({
  stripeEventType,
  stripeInvoice,
}: StripeEventParams) =>
  stripeEventType === "invoice.payment_succeeded" &&
  stripeInvoice.amount_paid > 0;
