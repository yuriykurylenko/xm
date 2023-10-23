import { Client } from "@/types/user";

import { UUID } from "crypto";
import { cancel as cancelStripeSubscription } from "@/integrations/stripe/models/subscription";
import { fetchAllByClientId as fetchSubscriptionsByClientId } from "@/domains/clients/domains/subscriptions/model";
import { fetch as fetchClientById } from "@/domains/clients/model";

export const handler = async (
  clientId: UUID,
  data: {
    endImmediately: boolean;
    accessAfterEndDate: boolean;
  }
) => {
  const { endImmediately, accessAfterEndDate } = data;
  const { data: subscriptions } = await fetchSubscriptionsByClientId(
    clientId as string
  );
  const { data: client } = await fetchClientById(clientId);

  for (const subscription of (subscriptions || []).filter((s) =>
    ["active", "trialing", "past_due", "unpaid"].includes(s.status)
  )) {
    try {
      await cancelStripeSubscription(subscription.stripe_subscription_id, {
        endImmediately,
        accessAfterEndDate,
      });
      return { data: client };
    } catch (error) {
      return {
        data: client,
        error: { message: "Error cancelling client's subscription" },
      };
    }
  }
};

export const show = (client: Client) =>
  ["past_due", "unpaid", "active", "trialing"].includes(
    client.subscription_status as string
  );
