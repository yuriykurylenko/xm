import { stripe } from "@/initializers/stripe";

export const fetch = (id: string) => stripe.invoices.retrieve(id);
