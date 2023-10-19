import { CardElementComponent } from "@stripe/react-stripe-js";
import { Subscription } from "@/types/subscription";
import router from "next/router";

import {
  activate as activateClient,
  fetch as fetchClientById,
} from "@/domains/clients/model";
import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import createStripeObject from "@/app/utils/createStripeObject";
import {
  PaymentMethod,
  SetupIntent,
  Stripe,
  StripeCardElement,
  StripeElements,
  StripeError,
} from "@stripe/stripe-js";
import { UUID } from "crypto";

type SubscriptionInput = {
  customerId: string;
  paymentMethodId: string | PaymentMethod | null;
  stripePriceId?: string;
  metadata?: { subscription_id: UUID };
  trialPeriodDays?: number;
  startDate?: Date;
};

type SetupResult = {
  data?: SetupIntent | null;
  error?: Error | StripeError | null;
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
  if (!stripe) {
    return {
      data: null,
      error: new Error("Stripe configuration is missing"),
    };
  }

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

    const {
      payment_intent: { status, client_secret, last_payment_error },
      error,
    } = stripeSubscription.latest_invoice;

    if (status === "succeeded") {
      return { data: stripeSubscription, error };
    } else if (status === "requires_action") {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        client_secret
      );
      return { data: stripeSubscription, error };
    } else if (last_payment_error) {
      return { data: stripeSubscription, error: last_payment_error };
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
  if (!stripe || !StripeCardElementInstance) {
    return {
      data: null,
      error: "Stripe or StripeCardElementInstance is not available",
    };
  }

  const {
    data: { client_secret: stripeClientSecret, customer: customerId },
  } = await createStripeObject("setupIntent", { email });

  const { error, setupIntent } =
    (await stripe.confirmCardSetup(stripeClientSecret, {
      payment_method: {
        card: StripeCardElementInstance,
        billing_details: { name },
      },
    })) ?? {};

  if (error) {
    return { data: null, error };
  }

  if (setupIntent && setupIntent.status === "succeeded") {
    return await createAndConfirmSubscription(
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
  } else {
    return { data: null, error: new Error("Unknown setup intent status.") };
  }
};

export const handler = async (
  subscriptionId: UUID,
  _data: {},
  { stripe, elements, CardElement }: StripeClientContext
) => {
  const { data: subscription } = await fetchSubscriptionById(subscriptionId);
  const { data: client } = await fetchClientById(subscription?.client_id);

  try {
    if (stripe && subscription && client) {
      const { data, error } = await handleCardAndSubscriptionSetup(
        {
          stripePriceId: subscription.stripe_price_id,
          email: client.email,
          name: client.full_name,
          metadata: {
            subscription_id: subscription.id,
          },
          trialPeriodDays: subscription.trial_period_days,
          startDate: subscription.start_date,
        },
        {
          stripe,
          StripeCardElementInstance:
            elements?.getElement(CardElement as CardElementComponent) || null,
        }
      );

      return { data: subscription, error };
    }
  } catch (error) {
    return {
      data: client,
      error: { message: "Error confirming subscription" },
    };
  }
};

export const onComplete = async (subscription: Subscription) => {
  await activateClient(subscription.id);
  router.push(`/subscription/${subscription.id}/success`);
};
