import { UUID } from "crypto";

export type Subscription = {
  id: UUID;
  client_id: UUID;
  stripe_subscription_id: string;
  monthly_amount: number;
  currency: string;
  status: string;
  stripe_price_id?: string;
  trial_period_days: number;
  start_date?: Date;
  end_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  access_after_end_date?: Date;
};

export type SubscriptionInput = {
  client_id?: UUID;
  stripe_subscription_id?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  monthly_amount?: number;
  currency?: string;
  stripe_price_id?: string;
  start_date?: Date;
  end_date?: Date;
  current_period_end_date?: Date;
  access_after_end_date?: boolean;
};
