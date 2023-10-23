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

export const show = (client: Client) => client.status === "starting";

export const handler = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
    trialPeriodDays,
    trialPeriod,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays?: number;
    trialPeriod?: boolean;
    startDate: Date;
  }
) => {
  const utcStartDate =
    startDate && startOfUtcDay(new Date(startDate)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(startDate))
      : startOfUtcDay(new Date());

  trialPeriodDays = trialPeriodDays || (trialPeriod ? 14 : 0);

  let trialEndDate = new Date(utcStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

  const { data: subscription } = await fetchSubscriptionByClientId(clientId);
  const { data: coach } = await fetchCoachByClientId(subscription?.client_id);
  const { data: client } = await fetchClientById(clientId);

  const { data: clientSubscription, error } = await createSubscription(
    clientId,
    {
      monthlyAmount: monthlyAmount,
      currency,
      trialPeriodDays: trialPeriodDays ? trialPeriodDays : trialPeriod ? 14 : 0,
      startDate: utcStartDate,
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
    unitAmount: monthlyAmount * 100,
    interval: "month",
    currency,
  });

  await createStripeSubscriptionSchedule({
    customerId: customer,
    startDate: new Date(utcStartDate),
    trialPeriodDays,
    priceId: price.id,
    quantity: 1,
    metadata: {
      subscription_id: clientSubscription?.id,
      updated: true,
    },
  });

  return { data: client, error };
};
