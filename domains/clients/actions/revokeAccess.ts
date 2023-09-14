import { Action } from "@/app/components/ItemList";
import { Client } from "@/types/user";

import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

const revokeAccess: Action<Client> = {
  name: "revokeAccess",
  title: "Revoke platform access",
  titleBulk: "Revoke access",
  icon: faPowerOff,
  show: (client: Client) =>
    !["starting", "client"].includes(client.status as string) &&
    client.access_revoked_at == null &&
    client.user_id != null,
  apiOperation: "revoke_access",
  dialogTitle: "Revoke access for {{full_name}}",
  dialogTitleBulk: "Revoke access for {{n}} clients",
  dialogText:
    "Are you sure you would like to revoke platform access for {{full_name}}?",
  dialogTextBulk:
    "Are you sure you would like to revoke platform access for {{n}} clients?",
};

export default revokeAccess;
