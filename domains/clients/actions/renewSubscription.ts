import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { PriceField } from "@/domains/clients/actions/common/components/DialogForms/PriceField";
import { changePriceOrRenewSubscription } from "./common/handlers";

import { faRotate } from "@fortawesome/free-solid-svg-icons";

const renewSubscriptionAction: Action<Client> = {
  title: "Renew client's subscription",
  titleBulk: "Renew subscriptions",
  icon: faRotate,
  show: (client: Client) =>
    client.status === "client" && client.end_date != null,
  apiHandler: changePriceOrRenewSubscription,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    PriceField({ items, coach: user as Coach }),
  dialogTitle: "Renew {{full_name}}'s subscription",
  dialogTitleBulk: "Renew {{n}} clients' subscriptions",
  dialogText: "Please specify the new price for {{full_name}} if applies.",
  dialogTextBulk: "Please specify the new price for your clients if applies.",
  dialogInfoText:
    "Your client's subscription will be renewed. You can specify the new price for {{full_name}}. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
  dialogInfoTextBulk:
    "Your clients' subscriptions will be renewed. You can specify the new price for them. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
};

export default renewSubscriptionAction;
