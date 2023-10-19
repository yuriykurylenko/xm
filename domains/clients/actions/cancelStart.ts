import { cancel as cancelStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { Action } from "@/types/action";
import { Client } from "@/types/user";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import { fetchAllByClientId as fetchSubscriptionsByClientId } from "@/domains/clients/domains/subscriptions/model";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { onComplete } from "@/domains/clients/actions/common/handlers";

const apiHandler = async (clientId: UUID, _: any) => {
  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);
  const { data: client } = await fetchClientById(clientId);

  for (const subscription of subscriptions || []) {
    try {
      await cancelStripeSubscriptionSchedule(
        subscription.stripe_subscription_id
      );
    } catch (error) {
      return {
        data: client,
        error: { message: "Error cancelling client's start" },
      };
    }
  }

  return { data: client, error: null };
};

const cancelStartAction: Action<Client> = {
  title: "Cancel starting client",
  titleBulk: "Cancel start",
  icon: faXmark,
  show: (client: Client) => client.status === "starting",
  apiHandler,
  onComplete,
  dialogTitle: "Cancel {{full_name}}'s start",
  dialogTitleBulk: "Cancel {{n}} clients' start",
  dialogText: "Are you sure you would like to cancel {{full_name}}'s start?",
  dialogTextBulk: "Are you sure you would like to cancel {{n}} clients' start?",
};

export default cancelStartAction;
