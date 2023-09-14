import { Action } from "@/app/components/ItemList";
import { Client, Coach } from "@/types/user";

import { ClientTermsFormFields } from "@/domains/clients/components/DialogForms/TermsFields";

import { faRotate } from "@fortawesome/free-solid-svg-icons";

const onSendOfferComplete = (
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus("offerSent");

const sendOfferToEndedClient: Action<Client> = {
  name: "sendOfferToEndedClient",
  title: "Send a new offer",
  titleBulk: "Send new offers",
  icon: faRotate,
  show: (client: Client) => client.status === "ended",
  apiOperation: "send_offer",
  onComplete: onSendOfferComplete,
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

export default sendOfferToEndedClient;
