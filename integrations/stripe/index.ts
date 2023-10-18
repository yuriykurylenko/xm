import {
  PaymentMethod,
  SetupIntent,
  Stripe,
  StripeCardElement,
  StripeElements,
  StripeError,
} from "@stripe/stripe-js";
import { UUID } from "crypto";
import createStripeObject from "@/app/utils/createStripeObject";
import { CardElementComponent } from "@stripe/react-stripe-js";

type BillingDetailsInput = { name: string };

type SubscriptionInput = {
  customerId: string;
  paymentMethodId: string | PaymentMethod | null;
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

export type StripeClientContext = {
  stripe: Stripe | null;
  elements?: StripeElements;
  CardElement?: CardElementComponent;
  StripeCardElementInstance?: StripeCardElement | null;
  stripeClientSecret?: string;
};

const confirmCardSetup = async (
  billingDetails: BillingDetailsInput,
  { stripe, StripeCardElementInstance, stripeClientSecret }: StripeClientContext
): Promise<SetupResult> => {
  if (!StripeCardElementInstance) {
    return {
      data: null,
      error: new Error("Card Element Instance is not available"),
    };
  }

  const { error, setupIntent } =
    (await stripe?.confirmCardSetup(stripeClientSecret as string, {
      payment_method: {
        card: StripeCardElementInstance,
        billing_details: billingDetails,
      },
    })) ?? {};

  return { data: setupIntent || null, error: error || null };
};

const createAndConfirmSubscription = async (
  {
    customerId,
    paymentMethodId,
    stripePriceId,
    metadata,
    trialPeriodDays,
    startDate,
  }: SubscriptionInput,
  { stripe }: StripeClientContext
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
          data: stripeSubscription,
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
            data: stripeSubscription,
            error: null,
          };
        }
      } else if (paymentIntent.last_payment_error) {
        return { data: null, error: paymentIntent.last_payment_error };
      }
    } else {
      return {
        data: stripeSubscription,
        error: null,
      };
    }
  } catch (error) {
    return { data: null, error: { message: "Error creating subscription" } };
  }
  return { data: null, error: null };
};

export const handleCardAndSubscriptionSetup = async (
  {
    email,
    name,
    stripePriceId,
    metadata,
    trialPeriodDays,
    startDate,
  }: CardAndSubscriptionInput,
  { stripe, StripeCardElementInstance }: StripeClientContext
): Promise<CardAndSubscriptionResult> => {
  const {
    data: { client_secret: stripeClientSecret, customer: customerId },
  } = await createStripeObject("setupIntent", { email });

  const { data: setupIntent, error: setupError } = await confirmCardSetup(
    {
      name,
    },
    {
      stripe,
      StripeCardElementInstance,
      stripeClientSecret,
    }
  );

  if (setupError) {
    return { data: null, error: setupError };
  }

  if (setupIntent && setupIntent.status === "requires_action") {
    const confirmResult = await stripe?.confirmCardSetup(
      setupIntent.client_secret as string
    );

    if (!confirmResult) {
      return { data: null, error: new Error("Failed to confirm card setup.") };
    }

    if (confirmResult.error) {
      return { data: null, error: confirmResult.error };
    }

    if (
      confirmResult.setupIntent &&
      confirmResult.setupIntent.status !== "succeeded"
    ) {
      return {
        data: null,
        error: new Error("Setup did not succeed after authentication."),
      };
    }
  } else if (!setupIntent || setupIntent.status !== "succeeded") {
    return { data: null, error: new Error("Setup did not succeed.") };
  }

  // Proceed to create subscription if setup succeeded
  const { data: subscriptionData, error: subscriptionError } =
    await createAndConfirmSubscription(
      {
        customerId,
        paymentMethodId: setupIntent.payment_method,
        stripePriceId,
        metadata,
        trialPeriodDays,
        startDate,
      },
      { stripe }
    );

  return { data: subscriptionData, error: subscriptionError };
};
