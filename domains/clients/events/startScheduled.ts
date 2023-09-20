import {
  updateClientById,
  updateClientSubscriptionById,
} from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripe_subscription_id }: { stripe_subscription_id: string }
) => {
  await updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id,
  });

  await updateClientById(client.id, {
    status: "starting",
  });
};

const startScheduledEvent = {
  handler,
  triggerConditions: ({
    stripeEventType,
    stripeSubscription,
  }: StripeEventParams) =>
    stripeEventType === "subscription_schedule.created" &&
    !stripeSubscription.metadata?.updated,
};

export default startScheduledEvent;
