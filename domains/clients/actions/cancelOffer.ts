import {
  updateClientById,
  updateSubscriptionByClientId,
} from "@/app/utils/api";
import { Action } from "@/types/action";
import { Client } from "@/types/user";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";

const apiHandler = async (clientId: UUID) => {
  const { error } = await updateSubscriptionByClientId(clientId, {
    archived_at: new Date(),
    start_date: null,
    end_date: null,
  });

  if (error) {
    return { data: null, error };
  }

  return await updateClientById(clientId, {
    status: "lead",
    subscription_status: null,
    start_date: null,
    end_date: null,
  });
};

const onComplete = (setFilterStatus?: (filterStatus: string) => void) =>
  setFilterStatus && setFilterStatus("lead");

const cancelOfferAction: Action<Client> = {
  title: "Cancel offer",
  titleBulk: "Cancel offers",
  icon: faXmark,
  show: (client: Client) => client.status === "offerSent",
  apiHandler,
  apiOperation: "cancelOffer",
  onComplete,
  dialogTitle: "Cancel {{full_name}}'s offer",
  dialogTitleBulk: "Cancel {{n}} clients' offers",
  dialogText: "Are you sure you would like to cancel {{full_name}}'s offer?",
  dialogTextBulk:
    "Are you sure you would like to cancel {{n}} clients' offers?",
};

export default cancelOfferAction;
