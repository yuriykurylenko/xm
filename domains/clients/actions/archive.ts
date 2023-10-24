import { Client } from "@/types/user";
import { update as updateClientById } from "@/domains/clients/model";
import { UUID } from "crypto";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const show = (client: Client) =>
  client.status === "lead" || client.subscription_status === "canceled";

export const handler = async (clientId: UUID) => {
  const { data, error } = await updateClientById(clientId as UUID, {
    archived_at: new Date(),
  });

  return { data, error };
};

export { onComplete };
