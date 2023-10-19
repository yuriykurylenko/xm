import { AuthFunctionsContext } from "@/app/hoc/withAuthFunctions";
import { fetch as fetchClientById } from "@/domains/clients/model";

import { UUID } from "crypto";
import router from "next/router";

interface ClientSignUpFormData {
  email: string;
  password: string;
}

export const handler = async (
  clientId: UUID,
  data: ClientSignUpFormData,
  { clientSignUp }: AuthFunctionsContext
) => {
  const { email, password } = data;
  await clientSignUp({
    email,
    password,
    clientId,
  });
  return await fetchClientById(clientId);
};

export const onComplete = () => {
  router.reload();
};
