import { Action } from "@/types/action";
import { Client } from "@/types/user";

import { ClientTermsFormFields } from "@/domains/clients/actions/common/components/DialogForms/TermsFields";
import {
  onSendOfferComplete,
  sendOffer,
} from "@/domains/clients/actions/common/handlers";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const sendOfferAction: Action<Client> = {
  title: "Send offer",
  titleBulk: "Send offers",
  icon: faPaperPlane,
  show: (client: Client) => client.status === "lead",
  apiHandler: sendOffer,
  onComplete: onSendOfferComplete,
  DialogForm: ({ items, user }: { items: Client[]; user: any }) =>
    ClientTermsFormFields({ items, coach: user }),
  dialogTitle: "Send offer to {{full_name}}",
  dialogTitleBulk: "Send offers to {{n}} clients",
  dialogText: "Please specify the price and start date for {{full_name}}.",
  dialogTextBulk: "Please specify the price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly.",
  dialogInfoTextBulk:
    "Your clients will receive an email with the link to subscribe and pay your specified amount monthly.",
};

export default sendOfferAction;
