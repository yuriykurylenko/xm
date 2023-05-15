import Head from "next/head";
import Header from "@/app/components/Header";
import "@/app/globals.css";
import supabase from "@/app/utils/supabaseClient";
import { useEffect, useState } from "react";
import withAuth from "@/app/components/withAuth";

const Welcome = ({ user }: { user: any }) => {
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    fetchCoach();
  }, []);

  async function fetchCoach() {
    const { data: coachData } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", (user as any).coach_id)
      .single();

    setCoach(coachData);
  }

  return (
    <div>
      <Head>
        <title>
          {(coach as any)?.full_name
            ? `${(coach as any)?.full_name} | Coaching`
            : "Loading..."}
        </title>
      </Head>
      <div className="form-container">
        <h1>Welcome, {(user as any)?.full_name}!</h1>
        <p>
          This is your space with {(coach as any)?.full_name}. <br />
          <br />
          More functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default withAuth(Welcome, ["client"]);
