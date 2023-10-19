import { stripe } from "@/integrations/stripe/initializer";

export const fetch = (id: string) => stripe.charges.retrieve(id);
