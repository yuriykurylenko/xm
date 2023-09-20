import { updateClientSubscriptionById } from "@/app/utils/api";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripe_subscription_id }: { stripe_subscription_id: string }
) =>
  updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id,
  });

const termsChangedEvent = {
  name: "termsChanged",
  handler,
  emailTemplateId: "d-306b9c3260cd4337b3528ee2e847bb31",
  triggerConditions: ({
    stripeEventType,
    stripeSubscription,
  }: StripeEventParams) =>
    stripeEventType === "subscription_schedule.created" &&
    stripeSubscription.metadata?.updated,
};

export default termsChangedEvent;
