import { Client } from "@/types/user";
import { changePriceOrRenewSubscription } from "@/domains/clients/actions/common/handlers";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const show = (client: Client) =>
  client.status === "client" && client.end_date === null;

export const handler = changePriceOrRenewSubscription;

export { onComplete };
