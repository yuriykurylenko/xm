import { SubscriptionInput } from "@/types/subscription";
import db from "@/initializers/supabaseClient";
import { UUID } from "crypto";
import { findOrCreate as findOrCreateStripePrice } from "@/integrations/stripe/models/price";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import { startOfUtcDay } from "@/app/utils/dateTime";

export const fetch = (id: UUID | string) =>
  db
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .is("archived_at", null)
    .single();

export const fetchBy = (key: string, value: string | number) =>
  db
    .from("subscriptions")
    .select("*")
    .eq(key, value)
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
    monthly_amount,
    currency,
    trial_period_days,
    start_date,
    stripe_subscription_id,
  }: {
    monthly_amount: number;
    currency: string;
    trial_period_days: number;
    start_date?: Date | string | null;
    stripe_subscription_id?: string | null;
  }
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const utcStartDate =
    start_date &&
    startOfUtcDay(new Date(start_date)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(start_date))
      : null;

  await updateByClientId(clientId, { archived_at: new Date() });

  const price = await findOrCreateStripePrice({
    productId: coach.stripe_product_id,
    interval: "month",
    unitAmount: monthly_amount * 100,
    currency,
  });

  return await db
    .from("subscriptions")
    .insert([
      {
        client_id: clientId,
        monthly_amount: monthly_amount * 100,
        currency,
        stripe_price_id: price.id,
        trial_period_days,
        start_date: utcStartDate,
        stripe_subscription_id,
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
