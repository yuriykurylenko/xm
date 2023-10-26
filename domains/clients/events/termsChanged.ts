import { update as updateSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { StripeEventParams } from "@/types/StripeEventParams";
import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

const handler = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripe_subscription_id }: { stripe_subscription_id: string }
) =>
  updateSubscriptionById(subscription.id, {
    stripe_subscription_id,
  });

export const triggerConditions = ({
  stripeEventType,
  stripeSubscription,
}: StripeEventParams) =>
  stripeEventType === "subscription_schedule.created" &&
  stripeSubscription.metadata?.updated;

const termsChangedEvent = {
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
