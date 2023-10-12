import { stripe } from "@/initializers/stripe";
import { update as updateStripeCustomer } from "@/integrations/stripe/customer";

export const create = async ({
  paymentMethodId,
  customerId,
}: {
  paymentMethodId: string;
  customerId: string;
}) => {
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  return await updateStripeCustomer({ customerId, paymentMethodId });
};
