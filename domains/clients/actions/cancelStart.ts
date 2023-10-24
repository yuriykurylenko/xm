import { cancel as cancelStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { Client } from "@/types/user";
import { UUID } from "crypto";
import { fetchAllByClientId as fetchSubscriptionsByClientId } from "@/domains/clients/domains/subscriptions/model";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const handler = async (clientId: UUID, _: any) => {
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

export const show = (client: Client) => client.status === "starting";

export { onComplete };
