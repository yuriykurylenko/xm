import { stripe } from "@/initializers/stripe";

export const fetch = (id: string) => stripe.charges.retrieve(id);
