import { Payment, Subscription } from "@/app/types/subscription";
import { Client, ClientInput, Coach } from "@/app/types/user";
import supabase from "@/app/utils/supabaseClient";
import axios from "axios";
import { UUID } from "crypto";
import { Invoice, Charge } from "@/app/types/subscription";

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
  sortColumn: string = "",
  sortDirection: "asc" | "desc" = "asc"
) => {
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  let query = supabase
    .from("clients")
    .select("*")
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

  return { ...response, total: total.count };
};

export const fetchSubscriptionById = (subscriptionId: UUID) =>
  supabase.from("subscriptions").select("*").eq("id", subscriptionId).single();

export const fetchSubscriptionByStripeSubscriptionId = (
  stripeSubscriptionId: string
) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
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

export const updateClientById = (clientId: UUID | string, data: ClientInput) =>
  supabase.from("clients").update(data).eq("id", clientId).select();

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

export const createPayment = async (payment: Payment) => {
  const { data, error } = await supabase.from("payments").insert([payment]);

  if (error) {
    throw error;
  }

  return data;
};

export const createInvoice = (invoice: Invoice) =>
  supabase.from("invoices").insert([invoice]).select();
export const createCharge = (charge: Charge) =>
  supabase.from("charges").insert([charge]).select();
