import StripeApi from "stripe";

export const create = (stripe: StripeApi, { email }: { email: string }) =>
  stripe.customers.create({
    email,
  });
