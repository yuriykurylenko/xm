import React from "react";
import { CardElement, CardElementComponent } from "@stripe/react-stripe-js";
import styles from "@/app/components/Form/styles.module.css";
import { Action } from "@/types/action";
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
import { withStripe } from "@/app/hoc/withStripe";

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

const handleCardAndSubscriptionSetup = async (
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

  const { data: setupIntentData, error } = await confirmCardSetup(
    {
      name,
    },
    {
      stripe,
      StripeCardElementInstance,
      stripeClientSecret,
    }
  );

  if (error) {
    return { data: null, error };
  }

  if (setupIntentData && setupIntentData.status === "succeeded") {
    const { data: subscriptionData, error } =
      await createAndConfirmSubscription(
        {
          customerId,
          paymentMethodId: setupIntentData.payment_method,
          stripePriceId,
          metadata,
          trialPeriodDays,
          startDate,
        },
        { stripe }
      );

    return { data: subscriptionData, error };
  }

  return { data: null, error };
};

const handler = async (
  subscriptionId: UUID,
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

      return { data, error };
    }
  } catch (error) {
    return {
      data: client,
      error: { message: "Error confirming subscription" },
    };
  }
};

const FormComponent = () => (
  <div className={styles["input-container"]}>
    <div className={styles["input"]}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#707070",
              },
              backgroundColor: "#fafafa",
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
    </div>
  </div>
);

const confirmSubscriptionAction: Action<Subscription> = {
  title: "Pay",
  submittingText: "Processing...",
  show: (subscription: Subscription) =>
    !subscription.start_date || new Date(subscription.start_date) <= new Date(),
  Form: FormComponent,
  formHoc: withStripe,
  handler,
  onComplete: async (subscription: Subscription) => {
    await activateClient(subscription.id);
    router.push(`/subscription/${subscription.id}/success`);
  },
};

export default confirmSubscriptionAction;
