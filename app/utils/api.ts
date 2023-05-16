import supabase from "@/app/utils/supabaseClient";

export const fetchCoachById = async (id: any) => {
    const { data: coachData } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", id)
      .single();

    return coachData;
}

export const fetchCoachBySlug = async (slug: any) => {
    const { data: coachData } = await supabase
      .from("coaches")
      .select("*")
      .eq("slug", slug)
      .single();

    return coachData;
}
