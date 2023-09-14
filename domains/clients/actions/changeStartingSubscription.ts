import { Action } from "@/app/components/ItemList";
import { Client, Coach } from "@/types/user";

import { ClientTermsFormFields } from "@/domains/clients/components/DialogForms/TermsFields";

import { faRotate } from "@fortawesome/free-solid-svg-icons";

const changeStartingSubscription: Action<Client> = {
  name: "changeStartingSubscription",
  title: "Change client's terms",
  titleBulk: "Change terms",
  icon: faRotate,
  show: (client: Client) => client.status === "starting",
  apiOperation: "change_terms",
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    ClientTermsFormFields({ items, coach: user as Coach }),
  dialogTitle: "Change terms for {{full_name}}",
  dialogTitleBulk: "Change terms {{n}} clients",
  dialogText: "Please specify the new price and start date for {{full_name}}.",
  dialogTextBulk:
    "Please specify the new price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email confirming the change of the terms but would not need to add their credit card again.",
  dialogInfoTextBulk:
    "Your clients will receive an email confirming the change of the terms but would not need to add their credit card again.",
};

export default changeStartingSubscription;
