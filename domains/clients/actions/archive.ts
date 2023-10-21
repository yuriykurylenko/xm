import { Client } from "@/types/user";
import { update as updateClientById } from "@/domains/clients/model";
import { UUID } from "crypto";

export const show = (client: Client) =>
  client.status === "lead" || client.subscription_status === "canceled";

export const handler = async (clientId: UUID) => {
  const { data, error } = await updateClientById(clientId as UUID, {
    archived_at: new Date(),
  });

  return { data, error };
};
