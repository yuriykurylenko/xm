import { Action } from "@/types/action";
import { Client } from "@/types/user";

import { update as updateClientById } from "@/domains/clients/model";

import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import { onComplete } from "@/domains/clients/actions/common/handlers";

const apiHandler = async (clientId: UUID) => {
  const { data, error } = await updateClientById(clientId as UUID, {
    access_revoked_at: new Date(),
  });

  return { data, error };
};

const revokeAccessAction: Action<Client> = {
  title: "Revoke platform access",
  titleBulk: "Revoke access",
  icon: faPowerOff,
  show: (client: Client) =>
    !["starting", "client"].includes(client.status as string) &&
    client.access_revoked_at == null &&
    client.user_id != null,
  apiHandler,
  onComplete,
  dialogTitle: "Revoke access for {{full_name}}",
  dialogTitleBulk: "Revoke access for {{n}} clients",
  dialogText:
    "Are you sure you would like to revoke platform access for {{full_name}}?",
  dialogTextBulk:
    "Are you sure you would like to revoke platform access for {{n}} clients?",
};

export default revokeAccessAction;
