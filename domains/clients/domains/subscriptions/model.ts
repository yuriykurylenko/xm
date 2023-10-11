import { SubscriptionInput } from "@/types/subscription";
import db from "@/initializers/supabaseClient";
import { UUID } from "crypto";
import { findOrCreatePrice as findOrCreateStripePrice } from "@/integrations/stripe";
import StripeApi from "stripe";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import { startOfUtcDay } from "@/app/utils/dateTime";

export const fetch = (id: UUID | string) =>
  db
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .is("archived_at", null)
    .single();

export const fetchByClientId = (clientId: UUID | string) =>
  db
    .from("subscriptions")
    .select("*")
    .eq("client_id", clientId)
    .is("archived_at", null)
    .single();

export const fetchByStripeSubscriptionId = (stripeSubscriptionId: string) =>
  db
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .is("archived_at", null)
    .single();

export const create = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
    trialPeriodDays,
    startDate,
    stripeSubscriptionId,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays: number;
    startDate?: Date | string | null;
    stripeSubscriptionId?: string | null;
  },
  stripe: StripeApi
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const utcStartDate =
    startDate && startOfUtcDay(new Date(startDate)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(startDate))
      : null;

  await updateByClientId(clientId, { archived_at: new Date() });

  const price = await findOrCreateStripePrice(stripe, {
    product: coach.stripe_product_id,
    interval: "month",
    unit_amount: monthlyAmount * 100,
    currency,
  });

  return await db
    .from("subscriptions")
    .insert([
      {
        client_id: clientId,
        monthly_amount: monthlyAmount * 100,
        currency,
        stripe_price_id: price.id,
        trial_period_days: trialPeriodDays,
        start_date: utcStartDate,
        stripe_subscription_id: stripeSubscriptionId,
      },
    ])
    .select()
    .single();
};

export const update = (id: UUID | string, data: SubscriptionInput) =>
  db.from("subscriptions").update(data).eq("id", id).select().single();

export const updateByStripeSubscriptionId = (
  stripeSubscriptionId: string,
  data: SubscriptionInput
) =>
  db
    .from("subscriptions")
    .update(data)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .select()
    .single();

export const updateByClientId = async (
  clientId: UUID | string,
  data: SubscriptionInput
) => db.from("subscriptions").update(data).eq("client_id", clientId).select();

export async function fetchAllByClientId(clientId: UUID | string) {
  try {
    const { data, error } = await db
      .from("subscriptions")
      .select("*")
      .is("archived_at", null)
      .eq("client_id", clientId);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
