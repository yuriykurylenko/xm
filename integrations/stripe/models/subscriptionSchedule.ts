import { UUID } from "crypto";
import StripeApi from "stripe";
import { stripe } from "@/integrations/stripe/initializer";

type CreateSubscriptionScheduleInput = {
  customerId: string | StripeApi.Customer | StripeApi.DeletedCustomer;
  startDate: Date;
  trialPeriodDays: number;
  priceId: string;
  quantity: number;
  metadata: {
    subscription_id: UUID;
    updated?: boolean;
  };
};

export const create = async ({
  customerId,
  startDate,
  trialPeriodDays,
  priceId,
  quantity = 1,
  metadata,
}: CreateSubscriptionScheduleInput) => {
  let trialEndDate = new Date(startDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

  return await stripe.subscriptionSchedules.create({
    //@ts-ignore
    customer: customerId,
    start_date: Math.floor(startDate.getTime() / 1000),
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
            quantity: quantity,
            metadata,
          },
        ],
        metadata,
      },
    ],
    metadata,
  });
};

export const cancel = (id: string) => stripe.subscriptionSchedules.cancel(id);
