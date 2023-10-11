import { PaymentMethod, Stripe } from "@stripe/stripe-js";
import StripeApi from "stripe";
import axios from "axios";
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

export const createAndConfirm = async (
  stripe: Stripe | null,
  customerId: string,
  paymentMethodId: string | PaymentMethod | null,
  {
    stripe_price_id,
    metadata,
    trial_period_days,
    start_date,
  }: {
    stripe_price_id?: string;
    metadata?: { subscription_id: UUID };
    trial_period_days?: number;
    start_date?: Date;
  }
) => {
  try {
    const { data: stripeSubscription } = await axios.post(
      "/api/integrations/stripe/subscription",
      {
        customerId,
        paymentMethodId,
        quantity: 1,
        priceId: stripe_price_id || "price_1N6JeAA4j0lnvK9GaP833Peg",
        metadata,
        trialPeriodDays: trial_period_days,
        startDate: start_date,
      }
    );

    const paymentIntent = stripeSubscription.latest_invoice?.payment_intent;

    if (paymentIntent) {
      if (paymentIntent.status === "succeeded") {
        return {
          data: { success: true, stripeSubscription: stripeSubscription },
          error: null,
        };
      } else if (paymentIntent.status === "requires_action") {
        const paymentIntentResult = await stripe?.confirmCardPayment(
          paymentIntent.client_secret
        );
        if (paymentIntentResult?.error) {
          return { data: null, error: paymentIntentResult.error };
        } else if (
          paymentIntentResult?.paymentIntent &&
          paymentIntentResult.paymentIntent.status === "succeeded"
        ) {
          return {
            data: {
              success: true,
              stripeSubscription,
            },
            error: null,
          };
        }
      } else if (paymentIntent.last_payment_error) {
        return { data: null, error: paymentIntent.last_payment_error };
      }
    } else {
      return {
        data: {
          success: true,
          stripeSubscription,
        },
        error: null,
      };
    }
  } catch (error) {
    return { data: null, error: { message: "Error creating subscription" } };
  }
  return { data: null, error: null };
};

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

      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId
      );

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
