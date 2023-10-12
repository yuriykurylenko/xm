import { PaymentMethod, Stripe, StripeCardElement } from "@stripe/stripe-js";
import { UUID } from "crypto";

import { confirm as confirmCardSetup } from "@/integrations/stripe/setupIntent";
import createStripeObject from "@/app/utils/createStripeObject";

const createAndConfirmSubscription = async (
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
    await createStripeObject("customerPaymentMethod", {
      customerId,
      paymentMethodId,
    });

    const { data: stripeSubscription } = await createStripeObject(
      "subscriptionOrSubscriptionSchedule",
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

export const handleCardAndSubscriptionSetup = async (
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
    data: { client_secret, customer: customerId },
  } = await createStripeObject("setupIntent", { email });

  const { data: setupIntentData, error } = await confirmCardSetup(
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
      await createAndConfirmSubscription(
        stripe,
        customerId,
        setupIntentData.payment_method,
        { stripe_price_id, metadata, trial_period_days, start_date }
      );

    return { data: subscriptionData, error };
  }

  return { data: null, error };
};
