import { UUID } from "crypto";

export type Subscription = {
  id: UUID;
  client_id: UUID;
  stripe_subscription_id: string;
  monthly_amount: number;
  currency: string;
  stripe_price_id?: string;
};

export type Invoice = {
  id?: UUID;
  created_at?: Date;
  subscription_id: UUID;
  stripe_invoice_id: string;
  stripe_invoice_number: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  due_date?: Date | null;
  last_charge_attempted_at?: Date | null;
  invoice_pdf?: string | null;
  hosted_invoice_url?: string | null;
};

export type Charge = {
  id?: UUID;
  created_at?: Date;
  updated_at?: Date;
  invoice_id: UUID;
  stripe_charge_id: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  currency: string;
  failure_code?: string | null;
  failure_message?: string | null;
  status: string;
  receipt_url?: string | null;
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
  receipt_url?: string;
};
