import StripeApi from "stripe";

import { Action } from "@/types/action";
import { Client } from "@/types/user";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import { cancelSubscription as cancelStripeSubscription } from "@/integrations/stripe";
import Input from "@/app/components/Form/Input";
import { fetchAllByClientId as fetchSubscriptionsByClientId } from "@/domains/clients/domains/subscriptions/model";

const DialogForm: React.FC = () => (
  <>
    <Input
      name="endImmediately"
      type="checkbox"
      placeholder="End immediately"
    />
    <Input
      name="accessAfterEndDate"
      type="checkbox"
      placeholder="Allow platform access after the end of the engagement"
    />
  </>
);

const apiHandler = async (
  clientId: UUID,
  data: {
    endImmediately: boolean;
    accessAfterEndDate: boolean;
  },
  { stripe }: { stripe: StripeApi }
) => {
  const { endImmediately, accessAfterEndDate } = data;
  const { data: subscriptions } = await fetchSubscriptionsByClientId(
    clientId as string
  );

  for (const subscription of (subscriptions || []).filter((s) =>
    ["active", "trialing", "past_due", "unpaid"].includes(s.status)
  )) {
    try {
      await cancelStripeSubscription(
        subscription.stripe_subscription_id,
        endImmediately,
        accessAfterEndDate,
        stripe
      );
    } catch (error) {
      return {
        data: null,
        error: { message: "Error cancelling client's subscription" },
      };
    }
  }

  return { data: subscriptions, error: null };
};

const onComplete = (setFilterStatus?: (filterStatus: string) => void) =>
  setFilterStatus && setFilterStatus("ended");

const cancelSubscriptionAction: Action<Client> = {
  title: "End client",
  titleBulk: "End clients",
  icon: faXmark,
  show: (client: Client) =>
    ["past_due", "unpaid", "active", "trialing"].includes(
      client.subscription_status as string
    ),
  apiHandler,
  onComplete,
  DialogForm: () => DialogForm({}),
  dialogTitle: "End {{full_name}}'s subscription",
  dialogTitleBulk: "End {{n}} clients",
  dialogText: "Are you sure you would like to end {{full_name}}?",
  dialogTextBulk: "Are you sure you would like to end {{n}} clients?",
  dialogInfoText:
    "If you choose not to end the subscription immediately, {{full_name}} will stop at the end of their monthly billing cycle.",
  dialogInfoTextBulk:
    "If you choose not to end the subscriptions immediately, your clients will stop at the end of their respective monthly billing cycles.",
};

export default cancelSubscriptionAction;
