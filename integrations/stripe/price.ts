import StripeApi from "stripe";
import { stripe } from "@/initializers/stripe";

const create = async ({
  product,
  unit_amount,
  interval,
  currency,
}: {
  product: string;
  interval: StripeApi.PriceCreateParams.Recurring.Interval;
  unit_amount: number;
  currency: string;
}) => {
  const price = await stripe.prices.create({
    product,
    unit_amount,
    currency,
    recurring: { interval: interval },
  });

  return { data: price };
};

export const findOrCreate = async ({
  product,
  interval,
  unit_amount,
  currency,
}: {
  product: string;
  interval: StripeApi.PriceCreateParams.Recurring.Interval;
  unit_amount: number;
  currency: string;
}) => {
  const prices = await stripe.prices.list({
    product,
  });

  const existingPrice = prices.data.find(
    (price) =>
      price.recurring?.interval === interval &&
      price.unit_amount === unit_amount &&
      price.currency.toLowerCase() === currency.toLowerCase()
  );

  if (!existingPrice) {
    const { data: price } = await create({
      product,
      unit_amount,
      interval,
      currency,
    });
    return price;
  }
  return existingPrice;
};
