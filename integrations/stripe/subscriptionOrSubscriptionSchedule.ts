import { UUID } from "crypto";
import { create as createSubscriptionSchedule } from "@/integrations/stripe/subscriptionSchedule";
import { create as createSubscription } from "@/integrations/stripe/subscription";

type CreateSubscriptionOrSubscriptionScheduleInput = {
  customerId: string;
  startDate: Date;
  trialPeriodDays: number;
  priceId: string;
  quantity: number;
  metadata: {
    subscription_id: UUID;
  };
};

export const create = async ({
  customerId,
  startDate,
  trialPeriodDays,
  priceId,
  quantity,
  metadata,
}: CreateSubscriptionOrSubscriptionScheduleInput) => {
  // Check if the start date is in the future
  if (startDate && new Date(startDate) > new Date()) {
    let trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

    return await createSubscriptionSchedule({
      customerId,
      startDate: new Date(startDate),
      trialPeriodDays,
      priceId,
      quantity,
      metadata,
    });
  } else {
    // Create the subscription
    return await createSubscription({
      customerId,
      priceId,
      quantity,
      metadata,
      trialPeriodDays,
    });
  }
};
