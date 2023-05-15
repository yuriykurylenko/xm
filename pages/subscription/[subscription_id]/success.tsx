import React, { useEffect, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/success.module.css";
import Head from "next/head";
import { useRouter } from "next/router";
import useAuth from "@/app/utils/useAuth";
import withAuth from "@/app/components/withAuth";

const Success = ({
  coach,
  client,
}: {
  coach: any;
  client: any;
}) => {
  const { user, error, clientSignUp } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.reload();
    }
    if (error) {
      setSubmitting(false);
    }
  }, [user, error])

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      // Sign up the client as a user
      await clientSignUp({ email: client.email, password, clientId: client.id })
      setSubmitting(false);
    } catch (error) {
      console.error("Error during sign-up:", error);
      setSubmitting(false);
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
            {error && (
              <div className={styles["error-message"]}>
                <>{error}</>
              </div>
            )}
            <button
              type="submit"
              className={styles["submit-btn"]}
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Success, ["anonymous"])

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
