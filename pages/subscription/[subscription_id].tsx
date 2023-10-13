import Head from "next/head";
import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import {
  activate as activateClient,
  fetch as fetchClientById,
} from "@/domains/clients/model";
import { fetch as fetchCoachById } from "@/domains/coaches/model";

import CheckoutForm from "@/domains/clients/domains/subscriptions/components/CheckoutForm";
import router from "next/router";
import withAuth, { AuthProps } from "@/app/hoc/withAuth";
import PageContainer from "@/app/components/PageContainer";
import { Coach, Client } from "@/types/user";
import { Subscription } from "@/types/subscription";
import { UUID } from "crypto";
import { formatAmount } from "@/app/utils/currency";
import { formatDate } from "@/app/utils/dateTime";

interface SubscriptionPageProps extends AuthProps {
  subscription: Subscription;
  coach: Coach;
  client: Client;
}

const SubscriptionPage = ({
  subscription,
  client,
  coach,
}: SubscriptionPageProps) => {
  async function onSubscriptionSuccess() {
    await activateClient(subscription.id);
    router.push(`/subscription/${subscription.id}/success`);
  }

  return (
    <div>
      <Head>
        <title>
          {coach?.full_name
            ? `${coach?.full_name} | Confirm subscription`
            : "Loading..."}
        </title>
      </Head>
      <PageContainer title="Coaching Subscription">
        <p>
          Dear <b>{client?.full_name}</b>,
        </p>
        <p>
          You will now start a coaching subscription with me. Please enter your
          payment details in the form below. Your start date is{" "}
          <b>{formatDate(subscription.start_date)}</b>, and you will be paying{" "}
          <b>
            {formatAmount(subscription?.monthly_amount, subscription.currency)}
          </b>{" "}
          monthly
          {subscription?.trial_period_days > 0 && (
            <>
              {" "}
              after a {subscription?.trial_period_days}-day free trial period
            </>
          )}
          .
        </p>
        <p>Can&apos;t wait to get started!</p>
        <p>
          Sincerely, <br />
          {coach?.full_name}
        </p>
        <CheckoutForm
          stripePriceId={subscription.stripe_price_id}
          customerEmail={client.email}
          customerFullName={client.full_name}
          onSubscriptionSuccess={onSubscriptionSuccess}
          subscriptionId={subscription.id}
          trialPeriodDays={subscription.trial_period_days}
          startDate={subscription.start_date}
        />
      </PageContainer>
    </div>
  );
};

export async function getServerSideProps(context: {
  params: { subscription_id: UUID };
}) {
  const { subscription_id } = context.params;
  const { data: subscription, error } = await fetchSubscriptionById(
    subscription_id
  );

  if (!subscription) {
    return {
      notFound: true,
    };
  }

  const { data: client } = await fetchClientById(subscription.client_id);
  const { data: coach } = await fetchCoachById(client?.coach_id);

  if (client && (client.status === "starting" || client.status === "client")) {
    return {
      redirect: {
        destination: `/subscription/${subscription_id}/success`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      subscription,
      client,
      coach,
    },
  };
}

export default withAuth(SubscriptionPage, ["anonymous"]);
