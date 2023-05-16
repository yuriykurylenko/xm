import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@/app/globals.css";
import supabase from "@/app/utils/supabaseClient";
import Head from "next/head";
import { fetchCoachBySlug } from "@/app/utils/api";

export default function ClientSignUpForm() {
  const router = useRouter();
  const { coachSlug } = router.query;
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    (async () => {
      if (coachSlug) {
        const { data } = await fetchCoachBySlug(coachSlug);
        setCoach(data);
      }
    })()
  }, [coachSlug]);

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Insert the client entry with a link to the coach
      const { data, error: insertError } = await supabase
        .from("clients")
        .insert([
          {
            full_name: fullName,
            email,
            coach_id: (coach as any).id,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      // Redirect the client to a success page or any other page you want
      router.push(`/${coachSlug}/success`);
    } catch (error) {
      console.error("Error during sign-up:", error);
      setLoading(false);
    }
  };

  return (
    <div className="form-container signup">
      <Head>
        <title>
          {(coach as any)?.full_name || coachSlug
            ? `${(coach as any)?.full_name || coachSlug} | Application`
            : "Loading..."}
        </title>
      </Head>
      <form onSubmit={handleSignUp} className="form">
        <h2>Apply to work with {(coach as any)?.full_name || coachSlug}</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
          title="Please enter a valid email address"
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Apply"}
        </button>
      </form>
    </div>
  );
}
