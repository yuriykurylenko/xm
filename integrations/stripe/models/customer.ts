import { stripe } from "@/integrations/stripe/initializer";
import Stripe from "stripe";

type CreateCustomerInput = {
  email: string;
};

type UpdateCustomerInput = {
  paymentMethodId: string;
};

export const create = ({
  email,
}: CreateCustomerInput): Promise<Stripe.Customer> =>
  stripe.customers.create({
    email,
  });

export const update = (
  id: string,
  { paymentMethodId }: UpdateCustomerInput
): Promise<Stripe.Customer> =>
  stripe.customers.update(id, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
