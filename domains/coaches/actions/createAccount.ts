import { AuthFunctionsContext } from "@/app/hoc/withAuthFunctions";
import router from "next/router";

interface CoachSignUpFormData {
  email: string;
  password: string;
  full_name: string;
  monthly_subscription_amount: number | string;
}

export const handler = (
  _: null,
  data: CoachSignUpFormData,
  { coachSignUp }: AuthFunctionsContext
) => {
  const { email, password, full_name, monthly_subscription_amount } = data;

  return coachSignUp({
    email,
    password,
    full_name,
    monthly_subscription_amount: Number(monthly_subscription_amount) * 100,
  });
};

export const onComplete = () => {
  router.reload();
};
