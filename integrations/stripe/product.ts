import StripeApi from "stripe";

export const create = async (stripe: StripeApi, { name }: { name: string }) => {
  const product = await stripe.products.create({ name });

  return { data: product };
};
