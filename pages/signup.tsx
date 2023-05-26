import Form from "@/app/components/Form";
import PriceInput from "@/app/components/Form/PriceInput";
import Input from "@/app/components/Form/Input";
import Button from "@/app/components/Form/Button";

import styles from "@/app/components/Form/styles.module.css";

import useAuth from "@/app/utils/useAuth";
import withAuth from "@/app/components/withAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const Signup = () => {
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
        <div className={styles["form-wrapper"]}>
          <Form onSubmit={onSubmit}>
            <h2 className={styles["form-header"]}>Sign up as a Coach</h2>
            <Input name="full_name" placeholder="Full Name" required />
            <Input name="email" placeholder="Email" type="email" required />
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
            <PriceInput
              name="monthly_subscription_amount"
              placeholder="Monthly price"
              required
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
    </div>
  );
};

export default withAuth(Signup, ["anonymous"]);
