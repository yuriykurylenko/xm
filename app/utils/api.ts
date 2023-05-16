import supabase from "@/app/utils/supabaseClient";

export const fetchCoachById = async (id: any) => await supabase
    .from("coaches")
    .select("*")
    .eq("id", id)
    .single();

export const fetchCoachBySlug = async (slug: any) => await supabase
    .from("coaches")
    .select("*")
    .eq("slug", slug)
    .single();
