import { Subscription } from "@/app/types/subscription";
import supabase from "@/app/utils/supabaseClient";
import axios from "axios";
import { UUID } from "crypto";

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

export const fetchClientsByCoachId = (coachId: UUID) =>
  supabase.from("clients").select("*").eq("coach_id", coachId);

export const fetchSubscriptionById = (subscriptionId: UUID) =>
  supabase.from("subscriptions").select("*").eq("id", subscriptionId).single();

export const createClient = ({
  full_name,
  email,
  coach_id,
}: {
  full_name: string;
  email: string;
  coach_id: UUID;
}) =>
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

const createClientSubscription = (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
  }: {
    monthlyAmount: number;
    currency: string;
  }
) =>
  supabase
    .from("subscriptions")
    .insert([
      {
        client_id: clientId,
        monthly_amount: monthlyAmount,
        currency,
      },
    ])
    .select();

export const updateClientById = (clientId: UUID, data: any) =>
  supabase.from("clients").update(data).eq("id", clientId);

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
  }: {
    monthlyAmount: number;
    currency: string;
  }
) => {
  const { data, error } = await createClientSubscription(clientId, {
    monthlyAmount,
    currency,
  });

  if (error) {
    return { data, error };
  }
  if (data) {
    sendClientPaymentLink({
      subscription: data[0] as Subscription,
      domain: `${window.location.protocol}//${window.location.host}`,
    });
  }
  return updateClientById(clientId, { status: "offerSent" });
};

const activateClientSubscription = (
  subscriptionId: UUID,
  stripeSubscriptionId: string
) =>
  supabase
    .from("subscriptions")
    .update({
      stripe_subscription_id: stripeSubscriptionId,
      status: "active",
    })
    .eq("id", subscriptionId)
    .select()
    .single();

export const activateClient = async (
  subscriptionId: UUID,
  stripeSubscriptionId: string
) => {
  const { data: subscription, error } = await activateClientSubscription(
    subscriptionId,
    stripeSubscriptionId
  );

  if (error) {
    return { data: subscription, error };
  }
  await updateClientById(subscription.client_id, { status: "client" });
};
