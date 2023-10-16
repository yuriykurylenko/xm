import { UUID } from "crypto";
import { stripe } from "@/initializers/stripe";
import {
  fetchByStripeSubscriptionId as fetchSubscriptionByStripeSubscriptionId,
  updateByStripeSubscriptionId as updateClientSubscriptionByStripeSubscriptionId,
} from "@/domains/clients/domains/subscriptions/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import { findOrCreate as findOrCreatePrice } from "@/integrations/stripe/price";

type CreateSubscriptionInput = {
  customerId: string;
  priceId: string;
  quantity: number;
  trialPeriodDays: number;
  metadata: { subscription_id: UUID };
};

type UpdateSubscriptionInput = {
  metadata?: {
    subscription_id: UUID;
  };
  monthlyAmount: number;
  currency: string;
  trialPeriodDays?: number;
  startDate?: Date | string | null;
  isActiveSubscription?: boolean;
};

type CancelSubscriptionInput = {
  endImmediately: boolean;
  accessAfterEndDate: boolean;
};

export const fetch = (id: string) => stripe.subscriptions.retrieve(id);

export const create = ({
  customerId,
  priceId,
  quantity = 1,
  trialPeriodDays,
  metadata,
}: CreateSubscriptionInput) =>
  stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId, quantity }],
    expand: ["latest_invoice.payment_intent"],
    metadata,
    trial_period_days: trialPeriodDays,
  });

export const update = async (
  id: string,
  { isActiveSubscription, monthlyAmount, currency }: UpdateSubscriptionInput
) => {
  try {
    const { data: subscription } =
      await fetchSubscriptionByStripeSubscriptionId(id);
    const { data: coach } = await fetchCoachByClientId(subscription?.client_id);

    if (isActiveSubscription) {
      const price = await findOrCreatePrice({
        productId: coach?.stripe_product_id,
        unitAmount: monthlyAmount,
        interval: "month",
        currency,
      });

      const subscription = await fetch(id);

      const stripeSubscription = await stripe.subscriptions.update(id, {
        cancel_at_period_end: false,
        proration_behavior: "none",
        items: [
          {
            id: subscription.items.data[0].id,
            price: price.id,
            quantity: 1,
          },
        ],
      });

      return { data: stripeSubscription };
    }

    return {
      data: null,
      error: { message: "Can't update price for inactive subscription" },
    };
  } catch (e) {
    return { data: null, error: { message: "Error updating subscription" } };
  }
};

export const cancel = async (
  id: string,
  { endImmediately, accessAfterEndDate }: CancelSubscriptionInput
) => {
  const canceledSubscription = endImmediately
    ? await stripe.subscriptions.del(id)
    : await stripe.subscriptions.update(id, {
        cancel_at_period_end: true,
      });

  await updateClientSubscriptionByStripeSubscriptionId(id, {
    access_after_end_date: accessAfterEndDate,
  });

  return canceledSubscription;
};
