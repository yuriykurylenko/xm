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
  {
    start_date,
    current_period_end_date,
    stripe_subscription_id,
    status,
  }: {
    start_date: Date;
    current_period_end_date: Date;
    stripe_subscription_id: string;
    status: string;
  }
) => {
  await updateClientSubscriptionById(subscription?.id, {
    stripe_subscription_id,
    status,
    start_date,
    current_period_end_date,
  });

  if (["active", "trialing"].includes(status)) {
    await updateClientById(client.id, {
      status: "client",
      access_revoked_at: null,
    });
  }
};

const startedEvent = {
  handler,
  triggerConditions: ({
    stripeEventType,
    stripeEventPreviousAttributes,
    stripeSubscription,
  }: StripeEventParams) =>
    stripeSubscription.status === "active" &&
    (stripeEventType === "customer.subscription.created" ||
      (stripeEventType === "customer.subscription.updated" &&
        stripeEventPreviousAttributes?.status)),
};

export default startedEvent;
