import { UUID } from "crypto";
import { Subscription } from "@/app/types/subscription";

export type User = {
  id?: UUID | string;
  full_name: string;
  email: string;
  created_at?: Date | string;
  user_id?: UUID | string;
};

export type Coach = User & {
  slug?: string;
  monthly_subscription_amount: number;
  subscription_currency: string;
  stripe_price_id?: string;
};

export type Client = User & {
  coach_id: UUID | string;
  status?: string;
  archived_at?: Date | string;
  subscription?: Subscription;
  subscription_status?: string;
  start_date?: Date;
  end_date?: Date;
  access_revoked_at?: Date;
};

export type UserInput = {
  full_name?: string;
  email?: string;
  user_id?: UUID | string | null;
};

export type ClientInput = UserInput & {
  coach_id?: UUID | string;
  status?: string;
  subscription_status?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  archived_at?: Date | string;
  access_revoked_at?: Date | string | null;
};

export type CoachInput = UserInput & {
  stripe_product_id?: string;
};
