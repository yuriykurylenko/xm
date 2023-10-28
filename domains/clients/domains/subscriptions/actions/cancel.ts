import { Client } from "@/types/user";

import { UUID } from "crypto";
import { cancel as cancelStripeSubscription } from "@/integrations/stripe/models/subscription";
import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const handler = async (
  subscriptionId: UUID,
  data: {
    endImmediately: boolean;
    accessAfterEndDate: boolean;
  }
) => {
  const { endImmediately, accessAfterEndDate } = data;
  const { data: subscription } = await fetchSubscriptionById(subscriptionId);

  if (
    ["active", "trialing", "past_due", "unpaid"].includes(subscription?.status)
  ) {
    try {
      await cancelStripeSubscription(subscription?.stripe_subscription_id, {
        endImmediately,
        accessAfterEndDate,
      });
      return { data: subscription };
    } catch (error) {
      return {
        data: subscription,
        error: { message: "Error cancelling client's subscription" },
      };
    }
  }
};

export const show = (client: Client) =>
  ["past_due", "unpaid", "active", "trialing"].includes(
    client.subscription_status as string
  );

export { onComplete };
