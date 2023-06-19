import { UUID } from "crypto";

export type User = {
  id?: UUID | string;
  full_name: string;
  email: string;
  user_id?: UUID | string;
};

export type Coach = User & {
  slug?: string;
  monthly_subscription_amount: number;
  subscription_currency: string;
};

export type Client = User & {
  coach_id: UUID | string;
  status?: string;
};

export type UserInput = {
  full_name?: string;
  email?: string;
  user_id?: UUID | string;
};

export type ClientInput = UserInput & {
  coach_id?: UUID | string;
  status?: string;
};
