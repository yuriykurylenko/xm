import Stripe from "stripe";
import { stripe } from "@/initializers/stripe";

type CreatePriceInput = {
  productId: string;
  interval: Stripe.PriceCreateParams.Recurring.Interval;
  unitAmount: number;
  currency: string;
};

const create = async ({
  productId,
  interval,
  unitAmount,
  currency,
}: CreatePriceInput): Promise<Stripe.Price> => {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring: { interval },
  });

  return price;
};

export const findOrCreate = async ({
  productId,
  interval,
  unitAmount,
  currency,
}: CreatePriceInput): Promise<Stripe.Price> => {
  const prices = await stripe.prices.list({
    product: productId,
  });

  const existingPrice = prices.data.find(
    (price) =>
      price.recurring?.interval === interval &&
      price.unit_amount === unitAmount &&
      price.currency.toLowerCase() === currency.toLowerCase()
  );

  if (!existingPrice) {
    return await create({
      productId,
      interval,
      unitAmount,
      currency,
    });
  }
  return existingPrice;
};
