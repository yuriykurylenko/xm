import { fetchClientById } from "@/app/utils/api";
import supabase from "@/initializers/supabaseClient";
import { CoachInput } from "@/types/user";
import { UUID } from "crypto";

export const fetch = (id: UUID) =>
  supabase.from("coaches").select("*").eq("id", id).single();

export const fetchBySlug = (slug: string) =>
  supabase.from("coaches").select("*").eq("slug", slug).single();

export const fetchByClientId = async (clientId: UUID) => {
  const { data, error } = await fetchClientById(clientId);
  if (error) {
    return { data, error };
  }
  return fetch(data.coach_id);
};

export const create = ({
  user_id,
  full_name,
  email,
  monthly_subscription_amount,
  subscription_currency,
}: CoachInput) =>
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

export const update = (id: UUID | string, data: CoachInput) =>
  supabase.from("coaches").update(data).eq("id", id).select().single();
