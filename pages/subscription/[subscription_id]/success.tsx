import React, { useEffect, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/success.module.css";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Success({
  coach,
  client,
}: {
  coach: any;
  client: any;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: clients } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id);

      if (clients?.[0]?.id) {
        router.push("/");
      } else if (client?.user_id) {
        router.push("/login");
      }
    } else if (client?.user_id) {
      router.push("/login");
    }
  }

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Sign up the client as a user
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email: client.email,
        password,
      });

      if (error) {
        throw error;
      }

      // Insert the client entry with a link to the coach
      const { data, error: updateError } = await supabase
        .from("clients")
        .update({
          user_id: user.id,
          status: "client",
        })
        .eq("id", client.id);

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signInWithPassword({
        email: client.email,
        password,
      });

      setLoading(false);
      router.push("/");
    } catch (error) {
      console.error("Error during sign-up:", error);
      setLoading(false);
    }
  };

  return (
    <div className={styles["parent-container"]}>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Get started` : "Loading..."}
        </title>
      </Head>
      <div className={styles["success-container"]}>
        <h1 className={styles["success-title"]}>
          Thank you, {client.full_name}!
        </h1>
        <p className={styles["success-text"]}>
          Your payment has been processed successfully and you have signed up to
          work with <b>{coach.full_name}</b>. We appreciate your business and
          look forward to supporting you on your coaching journey.
        </p>
        <p className={styles["success-text"]}>
          Now you can create your account and get access to exclusive materials.
        </p>

        <div className={`${styles["form-container"]}`}>
          <form onSubmit={handleSignUp} className={styles["form"]}>
            <input type="email" value={client.email} disabled />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              pattern=".{8,}"
              title="Password must be at least 8 characters long"
            />
            <button
              type="submit"
              className={styles["submit-btn"]}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { subscription_id } = context.params;

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscription_id)
    .single();

  if (subscriptionError || !subscriptionData.stripe_subscription_id) {
    return {
      notFound: true,
    };
  }

  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", subscriptionData.client_id)
    .single();

  if (clientError) {
    return {
      notFound: true,
    };
  }

  const { data: coachData, error: coachError } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", clientData.coach_id)
    .single();

  if (coachError) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coach: coachData,
      client: clientData,
    },
  };
}
