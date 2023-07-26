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
}: {
  customerId: string;
  paymentMethodId: string | PaymentMethod | null;
  quantity: number;
  priceId?: string;
}) =>
  axios.post("/api/subscription", {
    customerId,
    paymentMethodId,
    quantity,
    priceId: priceId || "price_1N6JeAA4j0lnvK9GaP833Peg",
  });

const createAndConfirmStripeSubscription = async (
  stripe: Stripe | null,
  customerId: string,
  paymentMethodId: string | PaymentMethod | null,
  {
    monthly_amount,
    coach_stripe_price_id,
  }: { monthly_amount: number; coach_stripe_price_id?: string }
) => {
  try {
    const { data: stripeSubscription } = await createStripeSubscription({
      customerId,
      paymentMethodId,
      quantity: monthly_amount / 100,
      priceId: coach_stripe_price_id,
    });

    const paymentIntent = stripeSubscription.latest_invoice.payment_intent;

    if (paymentIntent.status === "succeeded") {
      return {
        data: { success: true, stripeSubscriptionId: stripeSubscription.id },
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
            stripeSubscriptionId: stripeSubscription.id,
          },
          error: null,
        };
      }
    } else if (paymentIntent.last_payment_error) {
      return { data: null, error: paymentIntent.last_payment_error };
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
    coach_stripe_price_id,
    email,
    full_name,
    monthly_amount,
  }: {
    coach_stripe_price_id?: string;
    email: string;
    full_name: string;
    monthly_amount: number;
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
        { monthly_amount, coach_stripe_price_id }
      );

    return { data: subscriptionData, error };
  }

  return { data: null, error };
};

export const createStripeProductAndPriceForCoach = async (
  stripe: StripeApi,
  coach: Coach
) => {
  const { data: product } = await createStripeProductForCoach(stripe, coach);
  return await createStripePriceForProduct(stripe, product);
};

const createStripeProductForCoach = async (stripe: StripeApi, coach: Coach) => {
  const product = await stripe.products.create({
    name: `${coach.slug}_monthly_subscription`,
    type: "service",
  });

  return { data: product };
};

const createStripePriceForProduct = async (
  stripe: StripeApi,
  product: { id: string }
) => {
  const price = await stripe.prices.create({
    unit_amount: 100,
    currency: "USD",
    recurring: { interval: "month" },
    product: product.id,
  });

  return { data: price };
};
