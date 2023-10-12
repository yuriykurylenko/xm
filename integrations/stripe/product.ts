import StripeApi from "stripe";

export const create = (stripe: StripeApi, { name }: { name: string }) =>
  stripe.products.create({ name });
