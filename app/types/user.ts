import { UUID } from "crypto";

export type User = {
  id: UUID;
  full_name: string;
  email: string;
  user_id?: UUID;
};

export type Coach = User & {
  slug: string;
  monthly_subscription_amount: number;
};

export type Client = User & {
  coach_id: UUID;
  status: string;
};
