import { Client } from "@/types/user";
import { sendOffer } from "@/domains/clients/actions/common/handlers";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const show = (client: Client) => client.status === "lead";
export const handler = sendOffer;
export { onComplete };
