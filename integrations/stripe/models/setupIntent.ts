import Stripe from "stripe";
import { stripe } from "@/integrations/stripe/initializer";
import { create as createCustomer } from "@/integrations/stripe/models/customer";

type CreateSetupIntentInput = {
  email: string;
};

export const create = async ({
  email,
}: CreateSetupIntentInput): Promise<Stripe.SetupIntent> => {
  const customer = await createCustomer({ email });

  return await stripe.setupIntents.create({
    customer: customer.id,
  });
};
