import withAuth from "@/app/components/withAuth";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useAuth from "@/app/utils/useAuth";

import styles from "@/app/styles/form.module.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user, error, coachSignUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.reload();
    }
    if (error) {
      setSubmitting(false);
    }
  }, [user, error]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    setSubmitting(true);
    e.preventDefault();

    await coachSignUp({
      email,
      password,
      full_name: fullName,
      monthly_subscription_amount: Number(monthlyAmount) * 100,
    });
  };

  return (
    <div>
      <Head>
        <title>Coaching | Sign up</title>
      </Head>
      <div className={`${styles["form-container"]} ${styles["signup"]}`}>
        <form onSubmit={handleSubmit} className={styles["form"]}>
          <h2>Sign up as a Coach</h2>
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            pattern=".{8,}"
            title="Password must be at least 8 characters long"
          />
          <div className={styles["input-group"]}>
            <div className={styles["price-input"]}>
              <input
                type="number"
                placeholder="Monthly price"
                id="monthlyPrice"
                name="monthlyPrice"
                min="0"
                step="0.01"
                onChange={(event) => setMonthlyAmount(event.target.value)}
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
          </p>
        </form>
      </div>
    </div>
  );
};

export default withAuth(Signup, ["anonymous"]);
