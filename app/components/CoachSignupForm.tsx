import { useState } from "react";
import supabase from "../utils/supabaseClient";
import "../globals.css";

const CoachSignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createCoach(userId: any, email: any, fullName: any) {
    const { error: insertError } = await supabase.from("coaches").insert([
      {
        user_id: userId,
        email,
        full_name: fullName,
      },
    ]);

    if (insertError) {
      console.error(
        'Error during insertion into "coaches" table:',
        insertError.message
      );
    } else {
      console.log('User added to "coaches" table successfully');
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    // Sign up the user
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      console.error("Error during sign up:", signUpError.message);
      setLoading(false);
    }

    if (user) {
      await createCoach(user?.id, email, fullName);
    }

    setLoading(false);
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form">
        <h2>Sign Up as a Coach</h2>
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
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default CoachSignupForm;
