import { updateClientSubscriptionById } from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const onClientSubscriptionAutoRenewed = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { current_period_end_date }: { current_period_end_date: Date | null }
) =>
  updateClientSubscriptionById(subscription.id, {
    current_period_end_date:
      current_period_end_date && new Date(current_period_end_date),
  });

const clientSubscriptionAutoRenewedEvent = {
  name: "clientSubscriptionAutoRenewed",
  handler: onClientSubscriptionAutoRenewed,
  triggerConditions: ({ stripeEventType }: StripeEventParams) =>
    stripeEventType === "invoice.created",
};

export default clientSubscriptionAutoRenewedEvent;
