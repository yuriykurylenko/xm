import withAuth from "@/app/components/withAuth";
import Head from "next/head";
import Form from "@/app/components/Form";
import Input from "@/app/components/Form/Input";
import useAuth from "@/app/utils/useAuth";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/app/styles/form.module.css";

function Signup() {
  const { user, error, coachSignUp } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.reload();
    }
  }, [user]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await coachSignUp({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        monthly_subscription_amount: Number(data.monthlyAmount) * 100,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Coaching | Sign up</title>
      </Head>
      <div className={`${styles["form-container"]} ${styles["signup"]}`}>
        <Form onSubmit={handleSubmit} className={styles["form"]}>
          <h2>Sign up as a Coach</h2>
          <Input
            name="fullName"
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
          <Input
            name="monthlyAmount"
            placeholder="Monthly price"
            type="number"
            validation={{ required: "Monthly price is required" }}
          />
          <button
            type="submit"
            className={styles["submit-btn"]}
            disabled={submitting}
          >
            {submitting ? "Signing up..." : "Sign up"}
          </button>
          {error && (
            <div className={styles["error-message"]}>
              <>{error}</>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}

export default withAuth(Signup, ["anonymous"]);
