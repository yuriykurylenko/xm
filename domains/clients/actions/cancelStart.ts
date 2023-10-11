import StripeApi from "stripe";

import { cancel as cancelStripeSubscriptionSchedule } from "@/integrations/stripe/subscriptionSchedule";
import { Action } from "@/types/action";
import { Client } from "@/types/user";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import { fetchAllByClientId as fetchSubscriptionsByClientId } from "@/domains/clients/domains/subscriptions/model";

const apiHandler = async (
  clientId: UUID,
  _: any,
  { stripe }: { stripe: StripeApi }
) => {
  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);

  for (const subscription of subscriptions || []) {
    try {
      await cancelStripeSubscriptionSchedule(
        subscription.stripe_subscription_id,
        stripe
      );
    } catch (error) {
      return {
        data: null,
        error: { message: "Error cancelling client's start" },
      };
    }
  }

  return { data: subscriptions, error: null };
};

const onComplete = (setFilterStatus?: (filterStatus: string) => void) =>
  setFilterStatus && setFilterStatus("lead");

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
