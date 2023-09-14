import { Action } from "@/types/action";
import { Client } from "@/types/user";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const onCancelClientOfferComplete = (
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus("lead");

const cancelOffer: Action<Client> = {
  name: "cancelOffer",
  title: "Cancel offer",
  titleBulk: "Cancel offers",
  icon: faXmark,
  show: (client: Client) => client.status === "offerSent",
  apiOperation: "cancel_offer",
  onComplete: onCancelClientOfferComplete,
  dialogTitle: "Cancel {{full_name}}'s offer",
  dialogTitleBulk: "Cancel {{n}} clients' offers",
  dialogText: "Are you sure you would like to cancel {{full_name}}'s offer?",
  dialogTextBulk:
    "Are you sure you would like to cancel {{n}} clients' offers?",
};

export default cancelOffer;
