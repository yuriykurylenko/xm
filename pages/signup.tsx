import Form, { Button, Input } from "@/app/components/Form";
import styles from "@/app/components/Form/styles.module.css";

import useAuth from "@/app/utils/useAuth";
import withAuth from "@/app/components/withAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

function Signup() {
  const { user, error, coachSignUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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
    const { email, password, full_name, monthly_subscription_amount } = data;

    await coachSignUp({
      email,
      password,
      full_name,
      monthly_subscription_amount: Number(monthly_subscription_amount) * 100,
    });
    setSubmitting(false);
  };

  return (
    <div>
      <Head>
        <title>Coaching | Sign up</title>
      </Head>
      <div className={styles["form-container"]}>
        <Form onSubmit={onSubmit}>
          <h2 className={styles["form-header"]}>Sign up as a Coach</h2>
          <Input
            name="full_name"
            placeholder="Full Name"
            validation={{ required: "Full Name is required" }}
          />
          <Input
            name="email"
            placeholder="Email"
            validation={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Invalid email address",
              },
            }}
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            validation={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            }}
          />
          <Input
            className={styles["price-input"]}
            name="monthly_subscription_amount"
            placeholder="Monthly price"
            type="number"
            validation={{ required: "Monthly price is required" }}
          />
          <Button type="submit" disabled={submitting} error={error || ""}>
            {submitting ? "Signing up..." : "Sign up"}
          </Button>
          <p className={styles["sign-up-log-in"]}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>{" "}
        </Form>
      </div>
    </div>
  );
}

export default withAuth(Signup, ["anonymous"]);
