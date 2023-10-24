import { update as updateClientById } from "@/domains/clients/model";

import { Client } from "@/types/user";
import { UUID } from "crypto";
import { updateByClientId as updateSubscriptionByClientId } from "@/domains/clients/domains/subscriptions/model";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const handler = async (clientId: UUID) => {
  const { error } = await updateSubscriptionByClientId(clientId, {
    archived_at: new Date(),
    start_date: null,
    end_date: null,
  });

  if (error) {
    return { data: null, error };
  }

  return await updateClientById(clientId, {
    status: "lead",
    subscription_status: null,
    start_date: null,
    end_date: null,
  });
};

export const show = (client: Client) => client.status === "offerSent";

export { onComplete };
