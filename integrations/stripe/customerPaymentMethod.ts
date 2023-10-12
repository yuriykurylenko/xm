import StripeApi from "stripe";
import { update as updateStripeCustomer } from "@/integrations/stripe/customer";

export const create = async (
  stripe: StripeApi,
  {
    paymentMethodId,
    customerId,
  }: { paymentMethodId: string; customerId: string }
) => {
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  return await updateStripeCustomer(stripe, { customerId, paymentMethodId });
};
