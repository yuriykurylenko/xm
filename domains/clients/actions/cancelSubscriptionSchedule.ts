import { Action } from "@/app/components/ItemList";
import { Client } from "@/types/user";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const onCancelClientSubscriptionScheduleComplete = (
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus("lead");

const cancelSubscriptionSchedule: Action<Client> = {
  name: "cancelSubscriptionSchedule",
  title: "Cancel starting client",
  titleBulk: "Cancel start",
  icon: faXmark,
  show: (client: Client) => client.status === "starting",
  apiOperation: "cancel_start",
  onComplete: onCancelClientSubscriptionScheduleComplete,
  dialogTitle: "Cancel {{full_name}}'s start",
  dialogTitleBulk: "Cancel {{n}} clients' start",
  dialogText: "Are you sure you would like to cancel {{full_name}}'s start?",
  dialogTextBulk: "Are you sure you would like to cancel {{n}} clients' start?",
};

export default cancelSubscriptionSchedule;
