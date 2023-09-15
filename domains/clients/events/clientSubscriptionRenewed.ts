import { updateClientSubscriptionById } from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const onClientSubscriptionRenewed = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => updateClientSubscriptionById(subscription.id, { status, end_date });

const clientSubscriptionRenewedEvent = {
  name: "clientSubscriptionRenewed",
  handler: onClientSubscriptionRenewed,
  emailTemplateId: "d-664503562b62462d9931a694b35c5155",
  triggerConditions: ({
    stripeEventType,
    stripeEventPreviousAttributes,
  }: StripeEventParams) =>
    stripeEventType === "customer.subscription.updated" &&
    stripeEventPreviousAttributes.cancel_at_period_end,
};

export default clientSubscriptionRenewedEvent;
