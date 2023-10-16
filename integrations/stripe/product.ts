import Stripe from "stripe";
import { stripe } from "@/initializers/stripe";

type CreateProductInput = {
  name: string;
};

export const create = ({ name }: CreateProductInput): Promise<Stripe.Product> =>
  stripe.products.create({ name });
