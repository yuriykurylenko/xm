import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, fetchCoachBySlug } from "@/app/utils/api";

import styles from "@/app/styles/form.module.css";

export default function ClientSignUpForm({ coach }: { coach: any }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const { data: client, error } = await createClient({
        full_name: fullName,
        email,
        coach_id: coach.id,
      });

      if (error) {
        setError(error.message);
        setSubmitting(false);
      } else if (client) {
        router.push(`/${coach.slug}/success`);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className={`${styles["form-container"]} ${styles["signup"]}`}>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Application` : "Loading..."}
        </title>
      </Head>
      <form onSubmit={handleSignUp} className={styles["form"]}>
        <h2>Apply to work with {coach?.full_name}</h2>
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
        {error && (
          <div className="error-message">
            <>{error}</>
          </div>
        )}
        <button
          type="submit"
          className={styles["submit-btn"]}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Apply"}
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { coachSlug } = context.params;
  const { data: coach, error } = await fetchCoachBySlug(coachSlug);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coach,
    },
  };
}
