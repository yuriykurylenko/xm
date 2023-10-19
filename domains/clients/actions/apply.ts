import { Client, ClientInput } from "@/types/user";
import { create as createClient } from "@/domains/clients/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import router from "next/router";

export const handler = async (_clientId: null, data: ClientInput) => {
  const { full_name, email, coach_id } = data;
  const { data: client, error } = await createClient({
    full_name,
    email,
    coach_id,
  });

  return { data: client, error };
};

export const onComplete = async (client: Client) => {
  const { data: coach } = await fetchCoachByClientId(client.id);
  if (coach) {
    router.push(`/${coach.slug}/success`);
  }
};
