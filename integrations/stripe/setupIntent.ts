import StripeApi from "stripe";
import {
  SetupIntent,
  Stripe,
  StripeCardElement,
  StripeError,
} from "@stripe/stripe-js";

import { create as createCustomer } from "@/integrations/stripe/customer";

export const create = async (
  stripe: StripeApi,
  { email }: { email: string }
) => {
  const customer = await createCustomer(stripe, { email });
  return await stripe.setupIntents.create({
    customer: customer.id,
  });
};

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
