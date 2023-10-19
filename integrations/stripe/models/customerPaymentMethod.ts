import { stripe } from "@/integrations/stripe/initializer";
import { update as updateStripeCustomer } from "@/integrations/stripe/models/customer";
import Stripe from "stripe";

type CreateCustomerPaymentMethodInput = {
  paymentMethodId: string;
  customerId: string;
};

export const create = async ({
  paymentMethodId,
  customerId,
}: CreateCustomerPaymentMethodInput): Promise<
  Stripe.PaymentMethod | Stripe.Customer
> => {
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  return await updateStripeCustomer(customerId, { paymentMethodId });
};
