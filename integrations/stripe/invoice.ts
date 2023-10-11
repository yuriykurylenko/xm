import StripeApi from "stripe";

export const fetch = (stripe: StripeApi, id: string) =>
  stripe.invoices.retrieve(id);
