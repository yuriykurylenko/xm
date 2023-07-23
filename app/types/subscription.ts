import { UUID } from "crypto";

export type Subscription = {
  id: UUID;
  client_id: UUID;
  stripe_subscription_id: string;
  monthly_amount: number;
  currency: string;
};

export type Payment = {
  id?: UUID;
  stripe_invoice_id: string;
  subscription_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string;
  failure_message?: string;
  failure_code?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
};
