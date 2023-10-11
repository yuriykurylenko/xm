import axios from "axios";
import StripeApi from "stripe";

export const create = (
  stripe: StripeApi,
  { customerId }: { customerId: string }
) =>
  stripe.setupIntents.create({
    customer: customerId,
  });
