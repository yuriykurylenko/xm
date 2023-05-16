import supabase from "@/app/utils/supabaseClient";
import { UUID } from "crypto";

export const fetchCoachById = (id: string) => supabase
    .from("coaches")
    .select("*")
    .eq("id", id)
    .single();

export const fetchCoachBySlug = (slug: string) => supabase
    .from("coaches")
    .select("*")
    .eq("slug", slug)
    .single();

export const fetchClientsByCoachId = (coachId: UUID) => supabase
    .from("clients")
    .select("*")
    .eq("coach_id", coachId);

const createClientSubscription = (
    clientId: UUID, 
    { 
        monthlyAmount, 
        currency 
    }: { 
        monthlyAmount: number,
        currency: string
    }
) => supabase
    .from("subscriptions")
    .insert([
    {
        client_id: clientId,
        monthly_amount: monthlyAmount,
        currency
    },
    ])
    .select();

const updateClientById = (clientId: UUID, data: any) => supabase
    .from("clients")
    .update(data)
    .eq("id", clientId);

export const sendClientOffer = async (
    clientId: UUID,
    { 
        monthlyAmount, 
        currency 
    }: { 
        monthlyAmount: number,
        currency: string
    }
) => {
    const { data, error } = await createClientSubscription(
        clientId,
        { 
            monthlyAmount, 
            currency 
        }
    )

    if (error) { return { data, error }; }
    return updateClientById(clientId, { status: "offerSent" })
}
