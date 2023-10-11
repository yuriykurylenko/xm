import StripeApi from "stripe";

export const attach = (
  stripe: StripeApi,
  {
    paymentMethodId,
    customerId,
  }: { paymentMethodId: string; customerId: string }
) =>
  stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
