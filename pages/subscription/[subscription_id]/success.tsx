import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import useAuth from "@/app/hooks/useAuth";
import withAuth, { AuthProps } from "@/app/hoc/withAuth";

import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { fetch as fetchCoachById } from "@/domains/coaches/model";
import PageContainer from "@/app/components/PageContainer";
import { Coach, Client } from "@/types/user";
import { UUID } from "crypto";
import { formatDate } from "@/app/utils/dateTime";

interface SubscriptionSuccessPageProps extends AuthProps {
  coach: Coach;
  client: Client;
}

const Success = ({ coach, client }: SubscriptionSuccessPageProps) => {
  const { user } = useAuth();
  const router = useRouter();

  // TODO: fix apparently not fetching the user after signing up
  useEffect(() => {
    if (user) {
      router.reload();
    }
  }, [user, router]);

  return (
    <div>
      <Head>
        <title>
          {coach.full_name
            ? `${coach.full_name} | Payment succeeded`
            : "Loading..."}
        </title>
      </Head>
      <PageContainer title={`Thank you, ${client.full_name}!`}>
        <p>
          Your credit card has been processed successfully and you have signed
          up to work with <b>{coach.full_name}</b>
          {client.start_date
            ? ` starting from ${formatDate(client.start_date)}`
            : ""}
          .
        </p>
        <p>
          You will receive an email with a link to set up your account and get
          access to exclusive materials before your coaching journey starts.
        </p>
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

  if (clientData.status === "client") {
    return {
      redirect: {
        destination: `/subscription/${subscription_id}/account`,
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
