import React from "react";
import styles from "@/app/styles/success.module.css";
import Head from "next/head";
import { fetchCoachBySlug } from "@/app/utils/api";

export default function Success({ coachName }: { coachName: any }) {
  return (
    <div className={styles["parent-container"]}>
      <Head>
        <title>{coachName ? `${coachName} | Success` : "Loading..."}</title>
      </Head>
      <div className={styles["success-container"]}>
        <h1 className={styles["success-title"]}>Congratulations!</h1>
        <p className={styles["success-text"]}>
          You have succesfully applied to work with <b>{coachName}</b>. You will
          hear from us shortly.
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { coachSlug } = context.params;
  const { data, error } = await fetchCoachBySlug(coachSlug);

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
