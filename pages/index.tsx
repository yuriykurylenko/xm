import ClientApp from "@/app/components/ClientApp";
import supabase from "@/app/utils/supabaseClient";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useAuth from "@/app/utils/useAuth";

export default function Home() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [coach, setCoach] = useState(null);
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      fetchUser();
    }
  }, [loading]);

  async function fetchUser() {
    if (!user) {
      router.push("/signup");
      return;
    }

    if (role === "coach") {
      router.push("/clients");
      return;
    }

    if (role === "client") {
      setClient(user);

      const { data: coachData } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", (user as any).coach_id)
        .single();

      setCoach(coachData);
    }
  }

  return client ? <ClientApp client={client} coach={coach} /> : null;
}
