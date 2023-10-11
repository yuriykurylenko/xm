import { UUID } from "crypto";
import StripeApi from "stripe";

export const create = async (
  stripe: StripeApi,
  {
    customerId,
    startDate,
    trialPeriodDays,
    priceId,
    quantity,
    metadata,
  }: {
    customerId: string | StripeApi.Customer | StripeApi.DeletedCustomer;
    startDate: Date;
    trialPeriodDays: number;
    priceId: StripeApi.Price;
    quantity: number;
    metadata: {
      subscription_id: UUID;
      updated?: boolean;
    };
  }
) => {
  let trialEndDate = new Date(startDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

  await stripe.subscriptionSchedules.create({
    // @ts-ignore
    customer: customerId,
    start_date: Math.floor(new Date(startDate).getTime() / 1000),
    end_behavior: "release",
    phases: [
      {
        trial_end:
          trialPeriodDays > 0
            ? Math.floor(trialEndDate.getTime() / 1000)
            : undefined,
        items: [
          {
            price: priceId,
            quantity,
            metadata,
          },
        ],
        metadata,
      },
    ],
    metadata,
  });
};

export const cancel = (
  stripeSubscriptionScheduleId: string,
  stripe: StripeApi
) => stripe.subscriptionSchedules.cancel(stripeSubscriptionScheduleId);
