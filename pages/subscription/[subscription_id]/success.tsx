import React from "react";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/success.module.css";
import Head from "next/head";

export default function Success({
  coachName,
  clientName,
}: {
  coachName: any;
  clientName: any;
}) {
  return (
    <div className={styles["parent-container"]}>
      <Head>
        <title>{coachName ? `${coachName} | Get started` : "Loading..."}</title>
      </Head>
      <div className={styles["success-container"]}>
        <h1 className={styles["success-title"]}>Thank you, {clientName}!</h1>
        <p className={styles["success-text"]}>
          Your payment has been processed successfully and you have signed up to
          work with {coachName}. We appreciate your business and look forward to
          supporting you on your coaching journey.
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { subscription_id } = context.params;

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("client_id")
    .eq("id", subscription_id)
    .single();

  if (subscriptionError) {
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
      coachName: coachData.full_name,
      clientName: clientData.full_name,
    },
  };
}
