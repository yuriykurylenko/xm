import ClientApp from "@/app/components/ClientApp";
import supabase from "@/app/utils/supabaseClient";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", user.id);

      if (data[0]?.id) {
        router.push("/clients");
      } else {
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setClient(clientData);

        if (clientData) {
          const { data: coachData } = await supabase
            .from("coaches")
            .select("*")
            .eq("id", (clientData as any).coach_id)
            .single();

          setCoach(coachData);
        }
      }
    } else {
      router.push("/signup");
    }
  }

  return client ? <ClientApp client={client} coach={coach} /> : null;
}
