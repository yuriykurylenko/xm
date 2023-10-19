import React from "react";
import useAuth, { ClientSignUpParams } from "@/app/hooks/useAuth";
import { CoachInput, User } from "@/types/user";

import "@/styles/globals.css";

export interface AuthProps {
  user?: User | null | undefined;
}

export interface AuthResponse {
  data: User | null;
  error: { message: string } | null;
}

export type AuthFunctionsContext = {
  user: User;
  logIn: (email: string, password: string) => Promise<AuthResponse>;
  logOut: () => Promise<string | undefined>;
  coachSignUp: (params: CoachInput) => Promise<AuthResponse>;
  clientSignUp: (params: ClientSignUpParams) => Promise<AuthResponse>;
};

export const withAuthFunctions = <P extends AuthProps>(
  Component: React.FC<P>
): React.FC<P> => {
  const Wrapper: React.FC<P> = (props: P) => {
    const { user, logIn, logOut, coachSignUp, clientSignUp } = useAuth();

    return (
      <Component
        {...props}
        user={user}
        logIn={logIn}
        logOut={logOut}
        coachSignUp={coachSignUp}
        clientSignUp={clientSignUp}
      />
    );
  };

  return Wrapper;
};
