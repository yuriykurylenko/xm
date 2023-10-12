import StripeApi from "stripe";
import { UUID } from "crypto";

import {
  fetchByStripeSubscriptionId as fetchSubscriptionByStripeSubscriptionId,
  updateByStripeSubscriptionId as updateClientSubscriptionByStripeSubscriptionId,
} from "@/domains/clients/domains/subscriptions/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import { findOrCreate as findOrCreatePrice } from "@/integrations/stripe/price";

export const fetch = (stripe: StripeApi, id: string) =>
  stripe.subscriptions.retrieve(id);

export const create = (
  stripe: StripeApi,
  {
    customerId,
    priceId,
    quantity = 1,
    trialPeriodDays,
    metadata,
  }: {
    customerId: string;
    priceId: string;
    quantity: number;
    trialPeriodDays: number;
    metadata: { subscription_id: UUID };
  }
) =>
  stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId, quantity }],
    expand: ["latest_invoice.payment_intent"],
    metadata,
    trial_period_days: trialPeriodDays,
  });

export const update = async (
  {
    stripeSubscriptionId,
    monthlyAmount,
    currency,
    isActiveSubscription,
  }: {
    stripeSubscriptionId: string;
    metadata?: {
      subscription_id: UUID;
    };
    monthlyAmount: number;
    currency: string;
    trialPeriodDays?: number;
    startDate?: Date | string | null;
    isActiveSubscription?: boolean;
  },
  stripe: StripeApi
) => {
  try {
    const { data: subscription } =
      await fetchSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    const { data: coach } = await fetchCoachByClientId(subscription?.client_id);

    if (isActiveSubscription) {
      const price = await findOrCreatePrice(stripe, {
        product: coach?.stripe_product_id,
        unit_amount: monthlyAmount,
        interval: "month",
        currency,
      });

      const subscription = await fetch(stripe, stripeSubscriptionId);

      const stripeSubscription = await stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          cancel_at_period_end: false,
          // TODO: look into this
          proration_behavior: "none",
          items: [
            {
              id: subscription.items.data[0].id,
              price: price.id,
              quantity: 1,
            },
          ],
        }
      );

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
  stripeSubscriptionId: string,
  endImmediately: boolean,
  accessAfterEndDate: boolean,
  stripe: StripeApi
) => {
  const canceledSubscription = endImmediately
    ? await stripe.subscriptions.del(stripeSubscriptionId)
    : await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

  await updateClientSubscriptionByStripeSubscriptionId(stripeSubscriptionId, {
    access_after_end_date: accessAfterEndDate,
  });

  return canceledSubscription;
};
