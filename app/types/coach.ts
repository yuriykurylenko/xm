import { UUID } from "crypto";

export type Coach = {
  id: UUID;
  full_name: string;
  email: string;
  user_id?: UUID;
  slug: string;
};
