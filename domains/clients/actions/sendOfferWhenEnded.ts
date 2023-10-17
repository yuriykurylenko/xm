import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { ClientTermsFormFields } from "@/domains/clients/actions/common/components/DialogForms/TermsFields";
import {
  onComplete,
  sendOffer,
} from "@/domains/clients/actions/common/handlers";

import { faRotate } from "@fortawesome/free-solid-svg-icons";

const sendOfferWhenEndedAction: Action<Client> = {
  title: "Send a new offer",
  titleBulk: "Send new offers",
  icon: faRotate,
  show: (client: Client) => client.status === "ended",
  apiHandler: sendOffer,
  onComplete,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    ClientTermsFormFields({ items, coach: user as Coach }),
  dialogTitle: "Send a new offer to {{full_name}}",
  dialogTitleBulk: "Send new offers to {{n}} clients",
  dialogText: "Please specify the price and start date for {{full_name}}.",
  dialogTextBulk: "Please specify the price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly.",
  dialogInfoTextBulk:
    "Your clients will receive an email with the link to subscribe and pay your specified amount monthly.",
};

export default sendOfferWhenEndedAction;
