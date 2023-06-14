import { useState, useEffect, SetStateAction } from "react";
import supabase from "@/app/utils/supabaseClient";
import { User } from "../types/user";

interface CoachSignUpParams {
  email: string;
  password: string;
  full_name: string;
  monthly_subscription_amount: number;
}

interface ClientSignUpParams {
  email: string;
  password: string;
  clientId: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<SetStateAction<string>>("anonymous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  async function logIn(email: string, password: string) {
    clearError();
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return { data: null, error: error };
    }

    const profile = await getRoleAndProfile(user.id);
    setUser({ ...user, ...profile });

    return { data: user, error };
  }

  async function coachSignUp({
    email,
    password,
    full_name,
    monthly_subscription_amount,
  }: CoachSignUpParams) {
    clearError();

    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return { data: null, error: signUpError };
    }

    if (user) {
      const { data: profile, error: insertError } = await supabase
        .from("coaches")
        .insert({
          user_id: user.id,
          full_name,
          email,
          monthly_subscription_amount,
          subscription_currency: "USD",
        });

      if (insertError) {
        setError(insertError.message);
        return { data: null, error: insertError };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { data: null, error: signInError };
      }

      setUser({ ...user, ...profile });
      setRole("coach");

      return { data: user, error: signInError };
    }
  }

  async function clientSignUp({
    email,
    password,
    clientId,
  }: ClientSignUpParams) {
    const {
      data: { user },
      error: signupError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      return { data: null, error: signupError };
    }

    // Insert the client entry with a link to the coach
    const { data: profile, error: updateError } = await supabase
      .from("clients")
      .update({
        user_id: user.id,
        status: "client",
      })
      .eq("id", clientId);

    if (updateError) {
      setError(updateError.message);
      return { data: null, error: updateError };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return { data: null, error: signInError };
    }

    setRole("client");
    setUser({ ...user, ...profile });

    return { data: user, error: signInError };
  }

  async function getRoleAndProfile(userId: string) {
    const { data: coaches, error: coachError } = await supabase
      .from("coaches")
      .select("*")
      .eq("user_id", userId);

    if (coaches[0]) {
      setRole("coach");
      return coaches[0];
    }

    const { data: clients, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId);

    if (clients[0]) {
      setRole("client");
      return clients[0];
    }

    throw new Error("Role not found.");
  }

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return error.message;
    }
    setUser(null);
    setRole("");
  };

  useEffect(() => {
    const fetchUserAndRole = async () => {
      setLoading(true); // set loading to true at the start of the operation
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data?.user);
          const profile = await getRoleAndProfile(data?.user.id);

          setUser({ ...data?.user, ...profile });
        }
      } catch (error) {
        console.error("Error fetching user and role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRole();
  }, []);

  return {
    user,
    role,
    loading,
    error,
    logIn,
    logOut,
    coachSignUp,
    clientSignUp,
  };
}
