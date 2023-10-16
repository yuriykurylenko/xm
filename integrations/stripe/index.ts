import {
  PaymentMethod,
  SetupIntent,
  Stripe,
  StripeCardElement,
  StripeError,
} from "@stripe/stripe-js";
import { UUID } from "crypto";
import createStripeObject from "@/app/utils/createStripeObject";

type BillingDetailsInput = { name: string };

type SubscriptionInput = {
  stripePriceId?: string;
  metadata?: { subscription_id: UUID };
  trialPeriodDays?: number;
  startDate?: Date;
};

type SetupResult = {
  data: SetupIntent | null;
  error: Error | StripeError | null;
};

type SubscriptionResult = {
  data: { success: boolean; stripeSubscription?: any } | null;
  error: any;
};

type CardAndSubscriptionInput = {
  stripePriceId?: string;
  email: string;
  name: string;
  metadata?: { subscription_id: UUID };
  trialPeriodDays: number;
  startDate?: Date;
};

type CardAndSubscriptionResult = { data: any | null; error: any };

const confirmCardSetup = async (
  stripe: Stripe | null,
  StripeCardElementInstance: StripeCardElement | null,
  stripeClientSecret: string,
  billingDetails: BillingDetailsInput
): Promise<SetupResult> => {
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

const createAndConfirmSubscription = async (
  stripe: Stripe | null,
  customerId: string,
  paymentMethodId: string | PaymentMethod | null,
  {
    stripePriceId,
    metadata,
    trialPeriodDays,
    startDate,
  }: SubscriptionInput
): Promise<SubscriptionResult> => {
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
        priceId: stripePriceId || "price_1N6JeAA4j0lnvK9GaP833Peg",
        metadata,
        trialPeriodDays: trialPeriodDays,
        startDate: startDate,
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
    email,
    name,
    stripePriceId,
    metadata,
    trialPeriodDays,
    startDate,
  }: CardAndSubscriptionInput
): Promise<CardAndSubscriptionResult> => {
  const {
    data: { client_secret, customer: customerId },
  } = await createStripeObject("setupIntent", { email });

  const { data: setupIntentData, error } = await confirmCardSetup(
    stripe,
    StripeCardElementInstance,
    client_secret,
    {
      name,
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
        { stripePriceId, metadata, trialPeriodDays, startDate }
      );

    return { data: subscriptionData, error };
  }

  return { data: null, error };
};
