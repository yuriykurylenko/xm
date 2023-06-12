import { UUID } from "crypto";

export type Client = {
  id: UUID;
  full_name: string;
  email: string;
  user_id?: UUID;
  status: string;
};
