import { Client } from "@/types/user";
import { update as updateClientById } from "@/domains/clients/model";
import { UUID } from "crypto";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const handler = async (clientId: UUID) => {
  const { data, error } = await updateClientById(clientId as UUID, {
    access_revoked_at: new Date(),
  });

  return { data, error };
};

export const show = (client: Client) =>
  !["starting", "client"].includes(client.status as string) &&
  client.access_revoked_at == null &&
  client.user_id != null;

export { onComplete };
