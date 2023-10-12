import { stripe } from "@/initializers/stripe";

export const create = ({ name }: { name: string }) =>
  stripe.products.create({ name });
