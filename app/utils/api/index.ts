import { Subscription, SubscriptionInput } from "@/app/types/subscription";
import { Client, ClientInput, Coach, CoachInput } from "@/app/types/user";
import supabase from "@/app/utils/supabaseClient";
import axios from "axios";
import { UUID } from "crypto";
import {
  cancelStripeSubscription,
  cancelStripeSubscriptionSchedule,
  updateStripeSubscription,
} from "@/app/utils/api/stripe";

export const fetchCoachById = (id: UUID) =>
  supabase.from("coaches").select("*").eq("id", id).single();

export const fetchCoachBySlug = (slug: string) =>
  supabase.from("coaches").select("*").eq("slug", slug).single();

export const fetchClientById = (clientId: UUID) =>
  supabase.from("clients").select("*").eq("id", clientId).single();

export const fetchCoachByClientId = async (clientId: UUID) => {
  const { data, error } = await fetchClientById(clientId);
  if (error) {
    return { data, error };
  }
  return fetchCoachById(data.coach_id);
};

export const fetchClientsByCoachId = async (
  coachId: UUID,
  page: number = 1,
  filterStatus: string = "all",
  filterText: string = "",
  sortColumn: string = "updated_at",
  sortDirection: "asc" | "desc" = "desc"
) => {
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  let query = supabase
    .from("clients")
    .select(
      "*, subscriptions (status, updated_at, monthly_amount, currency, trial_period_days, archived_at)"
    )
    .eq("coach_id", coachId)
    .is("archived_at", null);

  let totalQuery = supabase
    .from("clients")
    .select("id", { count: "exact" })
    .eq("coach_id", coachId)
    .is("archived_at", null);

  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
    totalQuery = totalQuery.eq("status", filterStatus);
  }

  if (filterText) {
    query = query.ilike("full_name", `%${filterText}%`);
    totalQuery = totalQuery.ilike("full_name", `%${filterText}%`);
  }

  if (sortColumn) {
    query = query.order(sortColumn, { ascending: sortDirection === "asc" });
  }

  const response = await query.range(offset, offset + itemsPerPage - 1);
  const total = await totalQuery;

  if (response.data) {
    response.data = response.data.map((client) => ({
      ...client,
      subscription: client.subscriptions
        .filter((s: Subscription) => s.archived_at == null)
        .sort(
          (s1: Subscription, s2: Subscription) =>
            new Date(s2.updated_at as Date).getTime() -
            new Date(s1.updated_at as Date).getTime()
        )[0],
    }));
  }

  return { ...response, total: total.count };
};

export const fetchSubscriptionById = (subscriptionId: UUID | string) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
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

export const createClient = ({ full_name, email, coach_id }: Client) =>
  supabase
    .from("clients")
    .insert([
      {
        full_name,
        email,
        coach_id,
      },
    ])
    .select();

export const createCoach = ({
  user_id,
  full_name,
  email,
  monthly_subscription_amount,
  subscription_currency,
}: Coach) =>
  supabase
    .from("coaches")
    .insert({
      user_id,
      full_name,
      email,
      monthly_subscription_amount,
      subscription_currency,
    })
    .select();

const createClientSubscription = async (
  clientId: UUID,
  {
    productId,
    monthlyAmount,
    currency,
    trialPeriodDays,
    startDate,
  }: {
    productId: string;
    monthlyAmount: number;
    currency: string;
    trialPeriodDays: number;
    startDate?: Date | string | null;
  }
) => {
  const { data: price } = await axios.post("/api/find_or_create_price", {
    product: productId,
    interval: "month",
    unit_amount: monthlyAmount,
    currency,
  });

  return await supabase
    .from("subscriptions")
    .insert([
      {
        client_id: clientId,
        monthly_amount: monthlyAmount,
        currency,
        stripe_price_id: price.id,
        trial_period_days: trialPeriodDays,
        start_date: startDate,
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

export const updateClientById = (clientId: UUID | string, data: ClientInput) =>
  supabase.from("clients").update(data).eq("id", clientId).select();

export const updateCoachById = (coachId: UUID | string, data: CoachInput) =>
  supabase.from("coaches").update(data).eq("id", coachId).select();

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

const sendClientPaymentLink = ({
  subscription,
  domain,
}: {
  subscription: Subscription;
  domain: string;
}) =>
  axios.post("/api/send_payment_link", {
    subscription,
    domain,
  });

export const sendClientOffer = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
    trialPeriodDays,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays: number;
    startDate?: Date | string | null;
  }
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  await updateSubscriptionByClientId(clientId, { archived_at: new Date() });

  const { data, error } = await createClientSubscription(clientId, {
    productId: coach?.stripe_product_id,
    monthlyAmount,
    currency,
    trialPeriodDays,
    startDate,
  });

  if (error) {
    return { data, error };
  }
  if (data) {
    sendClientPaymentLink({
      subscription: data as Subscription,
      domain: `${window.location.protocol}//${window.location.host}`,
    });
  }
  return updateClientById(clientId, { status: "offerSent" });
};

export const changeClientSubscriptionSchedule = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
    trialPeriodDays,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays: number;
    startDate?: Date | string | null;
  }
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);

  if (!subscriptions?.length) {
    return { data: null, error: { message: "Client subscription not found" } };
  }

  const subscription = subscriptions?.[0];

  const { data: clientSubscription, error: clientSubscriptionError } =
    await createClientSubscription(clientId, {
      productId: coach?.stripe_product_id,
      monthlyAmount,
      currency,
      trialPeriodDays,
      startDate,
    });

  if (clientSubscriptionError || !clientSubscription) {
    return { data: clientSubscription, error: clientSubscriptionError };
  }

  try {
    await updateStripeSubscription({
      stripeSubscriptionId: subscription.stripe_subscription_id,
      metadata: { subscription_id: clientSubscription.id },
      monthlyAmount,
      currency,
      trialPeriodDays,
      startDate,
    });
  } catch (e) {
    return { data: null, error: { message: "Error updating client terms" } };
  }

  return { data: clientSubscription, error: null };
};

export const changeClientSubscriptionAmount = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
  }: {
    monthlyAmount: number;
    currency: string;
  }
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);

  if (!subscriptions?.length) {
    return { data: null, error: { message: "Client subscription not found" } };
  }

  const subscription = subscriptions?.[0];

  try {
    const { data: stripeSubscription } = await updateStripeSubscription({
      stripeSubscriptionId: subscription.stripe_subscription_id,
      monthlyAmount,
      currency,
      isActiveSubscription: true,
    });

    return { data: stripeSubscription, error: null };
  } catch (e) {
    return { data: null, error: { message: "Error updating client terms" } };
  }
};

export const activateClient = async (subscriptionId: UUID) => {
  const { data: subscription, error } = await fetchSubscriptionById(
    subscriptionId
  );

  if (error) {
    return { data: subscription, error };
  }
  await updateClientById(subscription.client_id, {
    status:
      new Date(subscription.start_date) <= new Date() ? "client" : "starting",
  });
};

async function fetchSubscriptionsByClientId(clientId: UUID | string) {
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

export const cancelClientSubscription = async (
  client: Client,
  endImmediately: boolean,
  accessAfterEndDate: boolean
) => {
  const { data: subscriptions } = await fetchSubscriptionsByClientId(
    client.id as string
  );

  for (const subscription of (subscriptions || []).filter((s) =>
    ["active", "trialing", "past_due", "unpaid"].includes(s.status)
  )) {
    try {
      await cancelStripeSubscription(
        subscription.stripe_subscription_id,
        endImmediately,
        accessAfterEndDate
      );
    } catch (error) {
      return { data: null, error };
    }
  }

  return { data: subscriptions, error: null };
};

export const cancelClientSubscriptionSchedule = async (client: Client) => {
  const { data: subscriptions } = await fetchSubscriptionsByClientId(
    client.id as string
  );

  for (const subscription of subscriptions || []) {
    try {
      await cancelStripeSubscriptionSchedule(
        subscription.stripe_subscription_id
      );
    } catch (error) {
      return { data: null, error };
    }
  }

  return { data: subscriptions, error: null };
};
