import supabase from "@/app/utils/supabaseClient";

export const fetchCoachById = (id: any) => supabase
    .from("coaches")
    .select("*")
    .eq("id", id)
    .single();

export const fetchCoachBySlug = (slug: any) => supabase
    .from("coaches")
    .select("*")
    .eq("slug", slug)
    .single();

export const fetchClientsByCoachId = (coachId: any) => supabase
    .from("clients")
    .select("*")
    .eq("coach_id", coachId);
