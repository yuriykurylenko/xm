import { stripe } from "@/initializers/stripe";

export const create = ({ email }: { email: string }) =>
  stripe.customers.create({
    email,
  });

export const update = ({
  customerId,
  paymentMethodId,
}: {
  customerId: string;
  paymentMethodId: string;
}) =>
  stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
