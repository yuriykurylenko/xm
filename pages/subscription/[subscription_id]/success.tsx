import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import Form from "@/app/components/Form";
import styles from "@/app/components/Form/styles.module.css";

import useAuth from "@/app/utils/useAuth";
import withAuth from "@/app/components/withAuth";
import {
  fetchClientById,
  fetchCoachById,
  fetchSubscriptionById,
} from "@/app/utils/api";
import Input from "@/app/components/Form/Input";
import Button from "@/app/components/Form/Button";

const Success = ({ coach, client }: { coach: any; client: any }) => {
  const { user, error, clientSignUp } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.reload();
    }
    if (error) {
      setSubmitting(false);
    }
  }, [user, error]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);

    try {
      const { password } = data;
      await clientSignUp({
        email: client.email,
        password,
        clientId: client.id,
      });
      setSubmitting(false);
    } catch (error) {
      console.error("Error during sign-up:", error);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Get started` : "Loading..."}
        </title>
      </Head>
      <div className={styles["form-container"]}>
        <div className={styles["form-wrapper"]}>
          <Form onSubmit={onSubmit}>
            <h1 className={styles["form-header"]}>
              Thank you, {client.full_name}!
            </h1>
            <p>
              Your payment has been processed successfully and you have signed
              up to work with <b>{coach.full_name}</b>. We appreciate your
              business and look forward to supporting you on your coaching
              journey.
            </p>
            <p>
              Now you can create your account and get access to exclusive
              materials.
            </p>
            <Input
              name="email"
              type="email"
              defaultValue={client.email}
              disabled
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
              validation={{
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              }}
            />
            <Button type="submit" disabled={submitting} error={error || ""}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Success, ["anonymous"]);

export async function getServerSideProps(context: any) {
  const { subscription_id } = context.params;

  const { data: subscriptionData, error: subscriptionError } =
    await fetchSubscriptionById(subscription_id);

  if (subscriptionError || !subscriptionData.stripe_subscription_id) {
    return {
      notFound: true,
    };
  }

  const { data: clientData, error: clientError } = await fetchClientById(
    subscriptionData.client_id
  );

  if (clientError) {
    return {
      notFound: true,
    };
  }

  const { data: coachData, error: coachError } = await fetchCoachById(
    clientData.coach_id
  );

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
