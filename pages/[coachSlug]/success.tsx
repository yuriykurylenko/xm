import React from "react";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/success.module.css";

export default function Success({ coachName }: { coachName: any }) {
  return (
    <div className={styles["parent-container"]}>
      <div className={styles["success-container"]}>
        <h1 className={styles["success-title"]}>Success!</h1>
        <p className={styles["success-text"]}>
          You have signed up to work with {coachName}. You will receive an email
          with the payment link shortly.
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { coachSlug } = context.params;

  const { data, error } = await supabase
    .from("coaches")
    .select("full_name")
    .eq("slug", coachSlug)
    .single();

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coachName: data.full_name,
    },
  };
}
