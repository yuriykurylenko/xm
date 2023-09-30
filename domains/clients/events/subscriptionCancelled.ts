import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { update as updateClientById } from "@/domains/clients/model";

import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => {
  await updateSubscriptionById(subscription.id, {
    status,
    end_date,
  });

  await updateClientById(subscription.client_id, {
    status: "ended",
    access_revoked_at: !subscription.access_after_end_date ? new Date() : null,
  });
};

const subscriptionCancelledEvent = {
  handler,
  triggerConditions: ({ stripeEventType }: StripeEventParams) =>
    stripeEventType === "customer.subscription.deleted",
};

export default subscriptionCancelledEvent;
