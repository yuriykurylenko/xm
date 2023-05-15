import { useState, useEffect, SetStateAction } from "react";
import supabase from "./supabaseClient";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<SetStateAction<null | string>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  async function logIn(email: any, password: any) {
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
      return null;
    }

    const profile = await getRoleAndProfile(user.id);
    setUser({ ...user, ...profile });

    return user;
  }

  async function coachSignUp({
    email,
    password,
    full_name,
    monthly_subscription_amount,
  }: {
    email: any;
    password: any;
    full_name: any;
    monthly_subscription_amount: any;
  }) {
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
      return null;
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
        return null;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return null;
      }

      setUser({ ...user, ...profile });
      setRole("coach");

      return user;
    }
  }

  async function clientSignUp({ 
    email, 
    password, 
    clientId 
  }: { 
    email: any, 
    password: any, 
    clientId: any 
  }) {
    const {
      data: { user },
      error: signupError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      return null;
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
      return null;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return null;
    }

    setRole("client");
    setUser({ ...user, ...profile });

    return user;
  }

  async function getRoleAndProfile(userId: any) {
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
        // handle the error appropriately for your application here
      } finally {
        setLoading(false); // set loading to false at the end of the operation
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
