import { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { UUID } from "crypto";

import { confirm as confirmCardSetup } from "@/integrations/stripe/setupIntent";
import { createAndConfirm as createAndConfirmSubscription } from "@/integrations/stripe/subscription";
import createStripeObject from "@/app/utils/createStripeObject";

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
