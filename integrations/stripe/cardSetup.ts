import {
  SetupIntent,
  Stripe,
  StripeCardElement,
  StripeError,
} from "@stripe/stripe-js";

export const confirm = async (
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
