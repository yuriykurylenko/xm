import { cancel as cancelStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { Client } from "@/types/user";
import { UUID } from "crypto";
import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const handler = async (subscriptiontId: UUID, _: any) => {
  const { data: subscription } = await fetchSubscriptionById(subscriptiontId);

  try {
    await cancelStripeSubscriptionSchedule(
      subscription?.stripe_subscription_id
    );
  } catch (error) {
    return {
      data: subscription,
      error: { message: "Error cancelling client's start" },
    };
  }

  return { data: subscription, error: null };
};

export const show = (client: Client) => client.status === "starting";

export { onComplete };
