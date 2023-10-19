import { AuthFunctionsContext } from "@/app/hoc/withAuthFunctions";
import router from "next/router";

export const handler = (
  _: null,
  data: {
    email: string;
    password: string;
  },
  { logIn }: AuthFunctionsContext
) => {
  const { email, password } = data;
  return logIn(email, password);
};

export const onComplete = () => {
  router.reload();
};
