import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { update as updateClientById } from "@/domains/clients/model";

import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) => {
  await updateSubscriptionById(subscription.id, {
    start_date: null,
    end_date: null,
    archived_at: new Date(),
  });

  await updateClientById(client.id, {
    status: "lead",
  });
};

const startCanceledEvent = {
  handler,
  triggerConditions: ({ stripeEventType, subscription }: StripeEventParams) =>
    stripeEventType === "subscription_schedule.canceled" &&
    !subscription.archived_at &&
    subscription.start_date &&
    new Date(subscription.start_date) >= new Date(),
};

export default startCanceledEvent;
