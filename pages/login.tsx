import { SetStateAction, useEffect, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import { useRouter } from "next/router";
import "@/app/globals.css";
import Link from "next/link";
import Head from "next/head";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<SetStateAction<null | string>>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await fetchCoach(user);
      await fetchClient(user);
    }
  };

  const fetchCoach = async (user: any) => {
    // Check if the user is a coach
    const { data: coachData, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
    } else if (coachData[0]?.id) {
      // Redirect to the /clients page if the user is a coach
      router.push("/clients");
    }
  };

  const fetchClient = async (user: any) => {
    // Check if the user is a client
    const { data: clientData, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
    } else if (clientData[0]?.id) {
      router.push("/");
    }
  };

  const handleLogin = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    const {
      error,
      data: { user },
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (user) {
      // Check if the user is a coach
      await fetchCoach(user);
      await fetchClient(user);
      setLoading(false);
    }
  };

  return (
    <div className="form-container signup">
      <Head>
        <title>Coaching | Log in</title>
      </Head>
      <form onSubmit={handleLogin} className="form">
        <h2>Log in</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}"
          title="Please enter a valid email address"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="error-message">
            <>{error}</>
          </div>
        )}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="log-in">
          Don&apos;t have an account yet? <Link href="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
