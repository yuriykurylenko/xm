import AnonymousLayout from "@/app/layouts/Anonymous";
import CoachLayout from "@/app/layouts/Coach";
import ClientLayout from "@/app/layouts/Client";

import useAuth from "@/app/hooks/useAuth";
import Loading from "@/app/components/Loading";
import { useRouter } from "next/router";

import "@/app/globals.css";

const DEFAULT_ROUTES = {
  anonymous: "/signup",
  coach: "/clients",
  client: "/home",
};

export default function withAuth(Component: any, supprotedRoles: String[]) {
  const Wrapper = (props: any) => {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return <Loading />;
    }

    if (!supprotedRoles.includes(role as string) || router.pathname === "/") {
      router.push((DEFAULT_ROUTES as any)[role as any]);
      return <Loading />;
    }

    if (role === "coach" && supprotedRoles.includes("coach")) {
      return (
        <CoachLayout>
          <Component {...props} user={user} />
        </CoachLayout>
      );
    }

    if (role === "client" && supprotedRoles.includes("client")) {
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
