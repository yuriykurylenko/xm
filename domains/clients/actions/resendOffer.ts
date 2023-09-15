import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { ClientTermsFormFields } from "@/domains/clients/components/DialogForms/TermsFields";
import { sendOffer } from "@/domains/clients/actions/common/handlers";

import { faRotate } from "@fortawesome/free-solid-svg-icons";

const onSendOfferComplete = (
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus("offerSent");

const resendOffer: Action<Client> = {
  name: "resendOffer",
  title: "Send a new offer",
  titleBulk: "Send new offers",
  icon: faRotate,
  show: (client: Client) => client.status === "offerSent",
  apiOperation: "resendOffer",
  apiHandler: sendOffer,
  onComplete: onSendOfferComplete,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    ClientTermsFormFields({ items, coach: user as Coach }),
  dialogTitle: "Send a new offer to {{full_name}}",
  dialogTitleBulk: "Send new offers to {{n}} clients",
  dialogText: "Please specify the new price and start date for {{full_name}}.",
  dialogTextBulk:
    "Please specify the new price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly. Your previous offer to them will be canceled.",
  dialogInfoTextBulk:
    "Your clients will receive an email with the link to subscribe and pay your specified amount monthly. Your previous offers to them will be canceled",
};

export default resendOffer;
