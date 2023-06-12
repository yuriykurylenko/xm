import React from "react";
import AnonymousLayout from "@/app/layouts/Anonymous";
import CoachLayout from "@/app/layouts/Coach";
import ClientLayout from "@/app/layouts/Client";

import useAuth from "@/app/hooks/useAuth";
import Loading from "@/app/components/Loading";
import { useRouter } from "next/router";
import { User } from "@/app/types/user";

import "@/app/globals.css";

const DEFAULT_ROUTES: Record<string, string> = {
  anonymous: "/signup",
  coach: "/clients",
  client: "/home",
};

export interface AuthProps {
  user?: User | null | undefined;
}

export default function withAuth<P extends AuthProps>(
  Component: React.FC<P>,
  supportedRoles: string[]
): React.FC<P> {
  const Wrapper: React.FC<P> = (props: P) => {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return <Loading />;
    }

    if (!supportedRoles.includes(role as string) || router.pathname === "/") {
      router.push(DEFAULT_ROUTES[role as string]);
      return <Loading />;
    }

    if (role === "coach" && supportedRoles.includes("coach")) {
      return (
        <CoachLayout>
          <Component {...props} user={user} />
        </CoachLayout>
      );
    }

    if (role === "client" && supportedRoles.includes("client")) {
      return (
        <ClientLayout>
          <Component {...props} user={user} />
        </ClientLayout>
      );
    }

    return (
      <AnonymousLayout>
        <Component {...props} />
      </AnonymousLayout>
    );
  };

  return Wrapper;
}
