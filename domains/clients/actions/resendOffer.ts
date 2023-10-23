import { Client } from "@/types/user";

import { sendOffer } from "@/domains/clients/actions/common/handlers";

export const show = (client: Client) => client.status === "offerSent";
export const handler = sendOffer;
