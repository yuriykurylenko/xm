import {
  updateClientById,
  updateClientSubscriptionById,
} from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const onClientSubscriptionCancelled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => {
  await updateClientSubscriptionById(subscription.id, {
    status,
    end_date,
  });

  await updateClientById(subscription.client_id, {
    status: "ended",
    access_revoked_at: !subscription.access_after_end_date ? new Date() : null,
  });
};

const clientSubscriptionCancelledEvent = {
  name: "clientSubscriptionCancelled",
  handler: onClientSubscriptionCancelled,
  triggerConditions: ({ stripeEventType }: StripeEventParams) =>
    stripeEventType === "customer.subscription.deleted",
};

export default clientSubscriptionCancelledEvent;
