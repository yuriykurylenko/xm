import StripeApi from "stripe";

export const create = (stripe: StripeApi, { email }: { email: string }) =>
  stripe.customers.create({
    email,
  });

export const update = (
  stripe: StripeApi,
  {
    customerId,
    paymentMethodId,
  }: { customerId: string; paymentMethodId: string }
) =>
  stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
