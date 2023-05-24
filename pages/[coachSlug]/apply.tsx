import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, fetchCoachBySlug } from "@/app/utils/api";

import Form, { Button, Input } from "@/app/components/Form";
import styles from "@/app/components/Form/styles.module.css";
import withAuth from "@/app/components/withAuth";

const ClientApplication = ({ coach }: { coach: any }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    setSubmitting(true);

    try {
      const { full_name, email } = data;
      const { data: client, error } = await createClient({
        full_name,
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
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Application` : "Loading..."}
        </title>
      </Head>
      <div className={styles["form-container"]}>
        <Form onSubmit={onSubmit}>
          <h2 className={styles["form-header"]}>
            Apply to work with {coach?.full_name}
          </h2>
          <Input name="full_name" placeholder="Full Name" required />
          <Input name="email" placeholder="Email" type="email" required />
          <Button type="submit" disabled={submitting} error={error || ""}>
            {submitting ? "Submitting..." : "Apply"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

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

export default withAuth(ClientApplication, ["anonymous"]);
