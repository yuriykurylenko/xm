import { Coach } from "@/app/types/user";
import {
  PaymentMethod,
  SetupIntent,
  Stripe,
  StripeCardElement,
  StripeError,
} from "@stripe/stripe-js";
import StripeApi from "stripe";
import axios from "axios";
import { UUID } from "crypto";
import {
  fetchCoachByClientId,
  fetchSubscriptionByStripeSubscriptionId,
} from "@/app/utils/api";

const createStripeSetupIntent = ({ email }: { email: string }) =>
  axios.post("/api/setup_intent", { email });

const confirmStripeCardSetup = async (
  stripe: Stripe | null,
  StripeCardElementInstance: StripeCardElement | null,
  stripeClientSecret: string,
  billingDetails: { name: string }
): Promise<{ data: SetupIntent | null; error: Error | StripeError | null }> => {
  if (!StripeCardElementInstance) {
    return {
      data: null,
      error: new Error("Card Element Instance is not available"),
    };
  }

  const { error, setupIntent } =
    (await stripe?.confirmCardSetup(stripeClientSecret, {
      payment_method: {
        card: StripeCardElementInstance,
        billing_details: billingDetails,
      },
    })) ?? {};

  return { data: setupIntent || null, error: error || null };
};

const createStripeSubscription = ({
  customerId,
  paymentMethodId,
  quantity,
  priceId,
  metadata,
  trialPeriodDays,
  startDate,
}: {
  customerId: string;
  paymentMethodId: string | PaymentMethod | null;
  quantity: number;
  priceId?: string;
  metadata?: {
    subscription_id: UUID;
  };
  trialPeriodDays?: number;
  startDate?: Date;
}) =>
  axios.post("/api/subscription", {
    customerId,
    paymentMethodId,
    quantity,
    priceId: priceId || "price_1N6JeAA4j0lnvK9GaP833Peg",
    metadata,
    trialPeriodDays,
    startDate,
  });

const createAndConfirmStripeSubscription = async (
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
    const { data: stripeSubscription } = await createStripeSubscription({
      customerId,
      paymentMethodId,
      quantity: 1,
      priceId: stripe_price_id,
      metadata,
      trialPeriodDays: trial_period_days,
      startDate: start_date,
    });

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

export const handleStripeCardAndSubscriptionSetup = async (
  stripe: Stripe | null,
  StripeCardElementInstance: StripeCardElement | null,
  {
    stripe_price_id,
    email,
    full_name,
    metadata,
    trial_period_days,
    start_date,
  }: {
    stripe_price_id?: string;
    email: string;
    full_name: string;
    metadata?: { subscription_id: UUID };
    trial_period_days: number;
    start_date?: Date;
  }
) => {
  const {
    data: { client_secret, customer_id },
  } = await createStripeSetupIntent({
    email,
  });

  const { data: setupIntentData, error } = await confirmStripeCardSetup(
    stripe,
    StripeCardElementInstance,
    client_secret,
    {
      name: full_name,
    }
  );

  if (error) {
    return { data: null, error };
  }

  if (setupIntentData && setupIntentData.status === "succeeded") {
    const { data: subscriptionData, error } =
      await createAndConfirmStripeSubscription(
        stripe,
        customer_id,
        setupIntentData.payment_method,
        { stripe_price_id, metadata, trial_period_days, start_date }
      );

    return { data: subscriptionData, error };
  }

  return { data: null, error };
};

export const createStripeProductForCoach = async (
  stripe: StripeApi,
  coach: Coach
) => {
  const product = await stripe.products.create({
    name: `${coach.full_name} - coaching subscription`,
    type: "service",
  });

  return { data: product };
};

const createStripePriceForProduct = async (
  stripe: StripeApi,
  {
    product,
    unit_amount,
    interval,
    currency,
  }: {
    product: string;
    interval: StripeApi.PriceCreateParams.Recurring.Interval;
    unit_amount: number;
    currency: string;
  }
) => {
  const price = await stripe.prices.create({
    product,
    unit_amount,
    currency,
    recurring: { interval: interval },
  });

  return { data: price };
};

export const findOrCreateStripePrice = async (
  stripe: StripeApi,
  {
    product,
    interval,
    unit_amount,
    currency,
  }: {
    product: string;
    interval: StripeApi.PriceCreateParams.Recurring.Interval;
    unit_amount: number;
    currency: string;
  }
) => {
  const prices = await stripe.prices.list({
    product,
  });

  const existingPrice = prices.data.find(
    (price) =>
      price.recurring?.interval === interval &&
      price.unit_amount === unit_amount &&
      price.currency.toLowerCase() === currency.toLowerCase()
  );

  if (!existingPrice) {
    const { data: price } = await createStripePriceForProduct(stripe, {
      product,
      unit_amount,
      interval,
      currency,
    });
    return price;
  }
  return existingPrice;
};

export const updateStripeSubscription = async (
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
      const price = await findOrCreateStripePrice(stripe, {
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

export const cancelStripeSubscription = (
  stripeSubscriptionId: string,
  endImmediately: boolean,
  accessAfterEndDate: boolean
) =>
  axios.post("/api/cancel_subscription", {
    stripeSubscriptionId,
    endImmediately,
    accessAfterEndDate,
  });

export const cancelStripeSubscriptionSchedule = (
  stripeSubscriptionScheduleId: string,
  stripe: StripeApi
) => stripe.subscriptionSchedules.cancel(stripeSubscriptionScheduleId);
