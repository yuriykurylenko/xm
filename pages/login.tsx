import { SetStateAction, useEffect, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import { useRouter } from "next/router";
import "@/app/globals.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<SetStateAction<null | string>>(null);
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
    }
  };

  const fetchCoach = async (user: any) => {
    // Check if the user is a coach
    const { data: coach, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      setError(error.message);
    } else if (coach) {
      // Redirect to the /clients page if the user is a coach
      router.push("/clients");
    } else {
      setError("You are not a coach.");
    }
  };

  const handleLogin = async (event: any) => {
    event.preventDefault();

    const {
      error,
      data: { user },
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (user) {
      // Check if the user is a coach
      await fetchCoach(user);
    }
  };

  return (
    <div className="form-container signup">
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
        <button type="submit" className="submit-btn">
          Log in
        </button>
        <p className="log-in">
          Don&apos;t have an account yet? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
