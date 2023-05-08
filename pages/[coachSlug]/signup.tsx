import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "../../app/globals.css";
import supabase from "@/app/utils/supabaseClient";

export default function ClientSignUpForm() {
  const router = useRouter();
  const { coachSlug } = router.query;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState(null);

  async function fetchCoach() {
    try {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("slug", coachSlug)
        .single();

      if (error) {
        throw error;
      }

      setCoach(data);
    } catch (error) {
      console.error("Error fetching coach:", error);
    }
  }

  useEffect(() => {
    if (coachSlug) {
      fetchCoach();
    }
  }, [coachSlug]);

  const handleSignUp = async (event: any) => {
    event.preventDefault();

    // Your client sign-up logic here
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSignUp} className="form">
        <h2>Sign Up to work with {(coach as any)?.full_name || coachSlug}</h2>
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          pattern=".{8,}"
          title="Password must be at least 8 characters long"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
