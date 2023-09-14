import { Action } from "@/app/components/ItemList";
import { Client } from "@/types/user";

import { EndClientFields } from "@/domains/clients/components/DialogForms/EndSubscriptionFields";

import { faXmark } from "@fortawesome/free-solid-svg-icons";

const onCancelClientSubscriptionComplete = (
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus("ended");

const endSubscription: Action<Client> = {
  name: "endSubscription",
  title: "End client",
  titleBulk: "End clients",
  icon: faXmark,
  show: (client: Client) =>
    ["past_due", "unpaid", "active", "trialing"].includes(
      client.subscription_status as string
    ),
  apiOperation: "cancel_subscription",
  onComplete: onCancelClientSubscriptionComplete,
  DialogForm: () => EndClientFields({}),
  dialogTitle: "End {{full_name}}'s subscription",
  dialogTitleBulk: "End {{n}} clients",
  dialogText: "Are you sure you would like to end {{full_name}}?",
  dialogTextBulk: "Are you sure you would like to end {{n}} clients?",
  dialogInfoText:
    "If you chose not to end the subscription immediately, {{full_name}} will stop at the end of their monthly billing cycle.",
  dialogInfoTextBulk:
    "If you chose not to end the subscriptions immediately, your clients will stop at the end of their respective monthly billing cycles.",
};

export default endSubscription;
