import { UUID } from "crypto";

export type User = {
  id: UUID;
  email: string;
  full_name: string;
  monthly_subscription_amount?: number;
  coach_id?: UUID;
  status?: string;
};
