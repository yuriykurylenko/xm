import { useState, useEffect, SetStateAction } from "react";
import supabase from "@/app/utils/supabaseClient";
import { Client, Coach, User } from "../types/user";

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

    if (user) {
      const profile = await getRoleAndProfile(user.id);
      setUser({ ...user, ...profile });
    }

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
        })
        .select();

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

      if (user && profile) {
        setUser({ ...user, ...(profile as unknown as Coach) });
        setRole("coach");
      }

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
    if (user) {
      const { data: profile, error: updateError } = await supabase
        .from("clients")
        .update({
          user_id: user.id,
          status: "client",
        })
        .eq("id", clientId)
        .single();

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
      if (user && profile) {
        setUser({ ...user, ...(profile as Client) });
      }

      return { data: user, error: signInError };
    }
  }

  async function getRoleAndProfile(userId: string) {
    const { data: coach } = await supabase
      .from("coaches")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (coach) {
      setRole("coach");
      return coach as unknown as Coach;
    }

    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (client) {
      setRole("client");
      return client as unknown as Client;
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
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
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
