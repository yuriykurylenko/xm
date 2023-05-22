import Form, { Input } from "@/app/components/Form";
import styles from "@/app/styles/form.module.css";

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

    await coachSignUp({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      monthly_subscription_amount: Number(data.monthlyAmount) * 100,
    });
    setSubmitting(false);
  };

  return (
    <div className={`${styles["form-container"]} ${styles["signup"]}`}>
      <Head>
        <title>Coaching | Sign up</title>
      </Head>
      <div className={styles["form"]}>
        <h2>Sign up as a Coach</h2>
        <Form onSubmit={onSubmit}>
          <Input
            name="full_name"
            placeholder="Full Name"
            validation={{ required: "Full Name is required" }}
          />
          <Input
            name="email"
            placeholder="Email"
            validation={{ required: "Email is required" }}
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            validation={{ required: "Password is required" }}
          />
          <div className={styles["input-group"]}>
            <div className={styles["price-input"]}>
              <Input
                name="monthly_price"
                placeholder="Monthly price"
                type="number"
                validation={{ required: "Monthly price is required" }}
              />
            </div>
          </div>
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
            {submitting ? "Signing up..." : "Sign up"}
          </button>
          <p className={styles["sign-up-log-in"]}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>{" "}
        </Form>
      </div>
    </div>
  );
}

export default withAuth(Signup, ["anonymous"]);
