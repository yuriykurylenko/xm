import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import Form from "@/app/components/Form";

import useAuth from "@/app/hooks/useAuth";
import withAuth, { AuthProps } from "@/app/hoc/withAuth";
import {
  fetchClientById,
  fetchCoachById,
  fetchSubscriptionById,
} from "@/app/utils/api";
import Input from "@/app/components/Form/Input";
import Button from "@/app/components/Form/Button";
import PageContainer from "@/app/components/PageContainer";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

interface SubscriptionSuccessPageProps extends AuthProps {
  coach: Coach;
  client: Client;
}

interface ClientSignUpFormData {
  email: string;
  password: string;
}

const Success = ({ coach, client }: SubscriptionSuccessPageProps) => {
  const { user, clientSignUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.reload();
    }
  }, [user, router]);

  const onSubmit = (data: ClientSignUpFormData) => {
    const { password } = data;
    return clientSignUp({
      email: client.email,
      password,
      clientId: client.id,
    });
  };

  return (
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Get started` : "Loading..."}
        </title>
      </Head>
      <PageContainer title={`Thank you, ${client.full_name}!`}>
        <Form<ClientSignUpFormData> onSubmit={onSubmit}>
          <p>
            Your payment has been processed successfully and you have signed up
            to work with <b>{coach.full_name}</b>. We appreciate your business
            and look forward to supporting you on your coaching journey.
          </p>
          <p>
            Now you can create your account and get access to exclusive
            materials.
          </p>
          <Input
            name="email"
            type="email"
            defaultValue={client.email}
            disabled
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            required
            validation={{
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            }}
          />
          <Button type="submit" submittingText="Creating account...">
            Create account
          </Button>
        </Form>
      </PageContainer>
    </div>
  );
};

export default withAuth(Success, ["anonymous"]);

export async function getServerSideProps(context: {
  params: { subscription_id: UUID };
}) {
  const { subscription_id } = context.params;

  const { data: subscriptionData, error: subscriptionError } =
    await fetchSubscriptionById(subscription_id);

  if (subscriptionError || !subscriptionData.stripe_subscription_id) {
    return {
      notFound: true,
    };
  }

  const { data: clientData, error: clientError } = await fetchClientById(
    subscriptionData.client_id
  );

  if (clientError) {
    return {
      notFound: true,
    };
  }

  const { data: coachData, error: coachError } = await fetchCoachById(
    clientData.coach_id
  );

  if (coachError) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coach: coachData,
      client: clientData,
    },
  };
}
