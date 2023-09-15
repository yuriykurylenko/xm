import {
  updateClientById,
  updateClientSubscriptionById,
} from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const onClientStartScheduled = async (
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

const clientStartScheduledEvent = {
  name: "clientStartScheduled",
  handler: onClientStartScheduled,
  triggerConditions: ({
    stripeEventType,
    stripeSubscription,
  }: StripeEventParams) =>
    stripeEventType === "subscription_schedule.created" &&
    !stripeSubscription.metadata?.updated,
};

export default clientStartScheduledEvent;
