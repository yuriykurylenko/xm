import StripeApi from "stripe";
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
