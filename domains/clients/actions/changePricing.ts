import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { PriceField } from "@/domains/clients/actions/common/components/DialogForms/PriceField";
import {
  changePriceOrRenewSubscription,
  onComplete,
} from "@/domains/clients/actions/common/handlers";

import { faDollarSign } from "@fortawesome/free-solid-svg-icons";

const changePricingAction: Action<Client> = {
  title: "Change client's monthly price",
  titleBulk: "Change price",
  icon: faDollarSign,
  show: (client: Client) =>
    client.status === "client" && client.end_date === null,
  apiHandler: changePriceOrRenewSubscription,
  onComplete,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    PriceField({ items, coach: user as Coach }),
  dialogTitle: "Change price for {{full_name}}",
  dialogTitleBulk: "Change price for {{n}} clients",
  dialogText: "Please specify the new price for {{full_name}}.",
  dialogTextBulk: "Please specify the new price for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email confirming the change of the terms but would not need to add their credit card again.",
  dialogInfoTextBulk:
    "Your clients will receive an email confirming the change of the terms but would not need to add their credit card again.",
};

export default changePricingAction;
