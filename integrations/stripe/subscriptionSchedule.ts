import StripeApi from "stripe";

export const cancel = (
  stripeSubscriptionScheduleId: string,
  stripe: StripeApi
) => stripe.subscriptionSchedules.cancel(stripeSubscriptionScheduleId);
