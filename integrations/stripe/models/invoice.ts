import { stripe } from "@/integrations/stripe/initializer";

export const fetch = (id: string) => stripe.invoices.retrieve(id);
