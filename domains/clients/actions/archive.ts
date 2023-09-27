import { Action } from "@/types/action";
import { Client } from "@/types/user";

import { update as updateClientById } from "@/domains/clients/model";

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";

const apiHandler = async (clientId: UUID) => {
  const { data, error } = await updateClientById(clientId as UUID, {
    archived_at: new Date(),
  });

  return { data, error };
};

const archiveAction: Action<Client> = {
  title: "Archive",
  titleBulk: "Archive",
  icon: faTrash,
  show: (client: Client) =>
    client.status === "lead" || client.subscription_status === "canceled",
  apiHandler,
  dialogTitle: "Archive {{full_name}}",
  dialogTitleBulk: "Archive {{n}} clients",
  dialogText: "Are you sure you would like to archive {{full_name}}?",
  dialogTextBulk: "Are you sure you would like to archive {{n}} clients?",
};

export default archiveAction;
