import { Action } from "@/app/components/ItemList";
import { Client } from "@/types/user";

import { faTrash } from "@fortawesome/free-solid-svg-icons";

const archive: Action<Client> = {
  name: "archive",
  title: "Archive",
  titleBulk: "Archive",
  icon: faTrash,
  show: (client: Client) =>
    client.status === "lead" || client.subscription_status === "canceled",
  apiOperation: "archive",
  dialogTitle: "Archive {{full_name}}",
  dialogTitleBulk: "Archive {{n}} clients",
  dialogText: "Are you sure you would like to archive {{full_name}}?",
  dialogTextBulk: "Are you sure you would like to archive {{n}} clients?",
};

export default archive;
