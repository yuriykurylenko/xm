import { updateClientSubscriptionById } from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => updateClientSubscriptionById(subscription.id, { status, end_date });

const subscriptionRenewedEvent = {
  name: "subscriptionRenewed",
  handler,
  emailTemplateId: "d-664503562b62462d9931a694b35c5155",
  triggerConditions: ({
    stripeEventType,
    stripeEventPreviousAttributes,
  }: StripeEventParams) =>
    stripeEventType === "customer.subscription.updated" &&
    stripeEventPreviousAttributes.cancel_at_period_end,
};

export default subscriptionRenewedEvent;
