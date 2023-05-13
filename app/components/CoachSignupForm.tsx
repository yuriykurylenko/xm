import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useAuth from "../utils/useAuth";
import Loading from "./Loading";

const CoachSignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user, role, loading, error, coachSignUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (role === "coach") {
        router.push("/clients");
      } else if (role === "client") {
        router.push("/");
      }
    }
  }, [user, role]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    setSubmitting(true);
    e.preventDefault();

    await coachSignUp({
      email,
      password,
      full_name: fullName,
      monthly_subscription_amount: Number(monthlyAmount) * 100,
    });

    if (user && role === "coach") {
      router.push("/clients");
      setSubmitting(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="form-container signup">
      <form onSubmit={handleSubmit} className="form">
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
        <div className="input-group">
          <div className="price-input">
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
          <div className="error-message">
            <>{error}</>
          </div>
        )}
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Signing up..." : "Sign up"}
        </button>
        <p className="log-in">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default CoachSignupForm;
