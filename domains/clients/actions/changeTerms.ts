import { Client } from "@/types/user";

import { UUID } from "crypto";
import { startOfUtcDay } from "@/app/utils/dateTime";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import {
  create as createSubscription,
  fetchByClientId as fetchSubscriptionByClientId,
} from "@/domains/clients/domains/subscriptions/model";
import { findOrCreate as findOrCreateStripePrice } from "@/integrations/stripe/models/price";
import { cancel as cancelStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { create as createStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { onComplete } from "@/domains/clients/actions/common/handlers";

export const show = (client: Client) => client.status === "starting";

export const handler = async (
  clientId: UUID,
  {
    monthly_amount,
    currency = "USD",
    trial_period_days,
    trial_period,
    start_date,
  }: {
    monthly_amount: number;
    currency: string;
    trial_period_days?: number;
    trial_period?: boolean;
    start_date: Date;
  }
) => {
  const utcStartDate =
    start_date &&
    startOfUtcDay(new Date(start_date)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(start_date))
      : startOfUtcDay(new Date());

  trial_period_days = trial_period_days || (trial_period ? 14 : 0);

  let trialEndDate = new Date(utcStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + trial_period_days);

  const { data: subscription } = await fetchSubscriptionByClientId(clientId);
  const { data: coach } = await fetchCoachByClientId(subscription?.client_id);
  const { data: client } = await fetchClientById(clientId);

  const { data: clientSubscription, error } = await createSubscription(
    clientId,
    {
      monthly_amount,
      currency,
      trial_period_days: trial_period_days
        ? trial_period_days
        : trial_period
        ? 14
        : 0,
      start_date: utcStartDate,
    }
  );

  if (error) {
    return { data: client, error };
  }

  const { customer } = await cancelStripeSubscriptionSchedule(
    subscription?.stripe_subscription_id
  );

  const price = await findOrCreateStripePrice({
    productId: coach?.stripe_product_id,
    unitAmount: monthly_amount * 100,
    interval: "month",
    currency,
  });

  await createStripeSubscriptionSchedule({
    customerId: customer,
    startDate: new Date(utcStartDate),
    trialPeriodDays: trial_period_days,
    priceId: price.id,
    quantity: 1,
    metadata: {
      subscription_id: clientSubscription?.id,
      updated: true,
    },
  });

  return { data: client, error };
};

export { onComplete };
