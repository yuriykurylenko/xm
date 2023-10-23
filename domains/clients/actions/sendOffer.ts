import { Client } from "@/types/user";
import { sendOffer } from "@/domains/clients/actions/common/handlers";

export const show = (client: Client) => client.status === "lead";
export const handler = sendOffer;

export const onComplete = (
  client: Client,
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus(client.status as string);
