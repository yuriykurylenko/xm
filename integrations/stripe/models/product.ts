import Stripe from "stripe";
import { stripe } from "@/integrations/stripe/initializer";

type CreateProductInput = {
  name: string;
};

export const create = ({ name }: CreateProductInput): Promise<Stripe.Product> =>
  stripe.products.create({ name });
