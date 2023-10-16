import { stripe } from "@/initializers/stripe";

import { create as createCustomer } from "@/integrations/stripe/customer";

export const create = async ({ email }: { email: string }) => {
  const customer = await createCustomer({ email });
  return await stripe.setupIntents.create({
    customer: customer.id,
  });
};
