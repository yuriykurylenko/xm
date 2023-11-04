import React from "react";
import Head from "next/head";

import withAuth, { AuthProps } from "@/app/hoc/withAuth";
import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { fetch as fetchCoachById } from "@/domains/coaches/model";
import PageContainer from "@/app/components/PageContainer";
import { Coach, Client } from "@/types/user";
import { UUID } from "crypto";
import ActionForm from "@/app/components/Actions/Form";

interface SubscriptionSuccessPageProps extends AuthProps {
  coach: Coach;
  client: Client;
}

const CreateAccountPage = ({ coach, client }: SubscriptionSuccessPageProps) => {
  return (
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Get started` : "Loading..."}
        </title>
      </Head>
      <PageContainer title={`Thank you, ${client.full_name}!`}>
        <p>
          Your payment has been processed successfully and you have signed up to
          work with <b>{coach.full_name}</b>. We appreciate your business and
          look forward to supporting you on your coaching journey.
        </p>
        <p>
          Now you can create your account and get access to exclusive materials.
        </p>

        <ActionForm
          action="clients.createAccount"
          itemId={client.id}
          values={{ email: client.email }}
        />
      </PageContainer>
    </div>
  );
};

export default withAuth(CreateAccountPage, ["anonymous"]);

export async function getServerSideProps(context: {
  params: { subscription_id: UUID };
}) {
  const { subscription_id } = context.params;

  const { data: subscriptionData, error: subscriptionError } =
    await fetchSubscriptionById(subscription_id);

  if (subscriptionError) {
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

  if (clientData.user_id) {
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
    };
  }

  if (clientData.status !== "client") {
    return {
      redirect: {
        destination: `/subscription/${subscription_id}`,
        permanent: false,
      },
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
