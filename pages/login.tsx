import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import useAuth from "@/app/utils/useAuth";
import "@/app/globals.css";
import withAuth from "@/app/components/withAuth";

const Login = () => {
  const { logIn, user, error } = useAuth();
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.reload();
    }
    if (error) {
      setSubmitting(false);
    }
  }, [user, error])

  const handleLogin = async (event: any) => {
    event.preventDefault();
    setSubmitting(true);

    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;

    await logIn(email, password);
  };

  return <div className="form-container signup">
    <Head>
      <title>Coaching | Log in</title>
    </Head>
    <form onSubmit={handleLogin} className="form">
      <h2>Log in</h2>
      <input
        type="email"
        placeholder="Email"
        required
        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
        title="Please enter a valid email address"
        name="email"
      />
      <input
        type="password"
        placeholder="Password"
        required
        name="password"
      />
      {error && (
        <div className="error-message">
          <>{error}</>
        </div>
      )}
      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? "Logging in..." : "Log in"}
      </button>
      <p className="log-in">
        Don&apos;t have an account yet? <Link href="/signup">Sign up</Link>
      </p>
    </form>
  </div>
}

export default withAuth(Login, ["anonymous"])
