import { SubscriptionInput } from "@/types/subscription";
import supabase from "@/initializers/supabaseClient";
import { UUID } from "crypto";
import { findOrCreateStripePrice } from "@/app/utils/api/stripe";
import StripeApi from "stripe";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";

export const startOfUtcDay = (date: Date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
};

export const fetchSubscriptionById = (subscriptionId: UUID | string) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .is("archived_at", null)
    .single();

export const fetchSubscriptionByClientId = (clientId: UUID | string) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", clientId)
    .is("archived_at", null)
    .single();

export const fetchSubscriptionByStripeSubscriptionId = (
  stripeSubscriptionId: string
) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .is("archived_at", null)
    .single();

export const createClientSubscription = async (
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

  await updateSubscriptionByClientId(clientId, { archived_at: new Date() });

  const price = await findOrCreateStripePrice(stripe, {
    product: coach.stripe_product_id,
    interval: "month",
    unit_amount: monthlyAmount * 100,
    currency,
  });

  return await supabase
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

export const updateClientSubscriptionById = (
  subscriptionId: UUID | string,
  data: SubscriptionInput
) =>
  supabase
    .from("subscriptions")
    .update(data)
    .eq("id", subscriptionId)
    .select()
    .single();

export const updateClientSubscriptionByStripeSubscriptionId = (
  stripeSubscriptionId: string,
  data: SubscriptionInput
) =>
  supabase
    .from("subscriptions")
    .update(data)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .select()
    .single();

export const updateSubscriptionByClientId = async (
  clientId: UUID | string,
  data: SubscriptionInput
) =>
  supabase
    .from("subscriptions")
    .update(data)
    .eq("client_id", clientId)
    .select();

export const updateSubscriptionById = async (
  subscriptionId: UUID | string,
  data: SubscriptionInput
) =>
  supabase.from("subscriptions").update(data).eq("id", subscriptionId).select();

export async function fetchSubscriptionsByClientId(clientId: UUID | string) {
  try {
    const { data, error } = await supabase
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
