import Head from "next/head";
import {
  activateClient,
  fetchClientById,
  fetchCoachById,
  fetchSubscriptionById,
} from "@/app/utils/api";
import CheckoutForm from "@/app/components/CheckoutForm";
import router from "next/router";
import withAuth, { AuthProps } from "@/app/hoc/withAuth";
import PageContainer from "@/app/components/PageContainer";
import { Coach, Client } from "@/app/types/user";
import { Subscription } from "@/app/types/subscription";
import { UUID } from "crypto";

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
  // Helper function to format the subscription amount
  const formatAmount = (amount: number, currency: string) => {
    const formattedAmount = Number((amount / 100).toFixed(2));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(formattedAmount);
  };

  async function onSubscriptionSuccess(stripeSubscriptionId: string) {
    await activateClient(subscription.id, stripeSubscriptionId);
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
          Dear <b>{client?.full_name}</b>, you will now start a coaching
          subscription with me. Please enter your payment details in the form
          below. You will be paying{" "}
          <b>
            {formatAmount(subscription?.monthly_amount, subscription.currency)}
          </b>{" "}
          monthly. Can&apos;t wait to get started!
        </p>
        <p>
          Sincerely, <br />
          {coach?.full_name}
        </p>
        <CheckoutForm
          client={client}
          subscription={subscription}
          onSubscriptionSuccess={onSubscriptionSuccess}
        />
      </PageContainer>
    </div>
  );
};

export async function getServerSideProps(context: {
  params: { subscription_id: UUID };
}) {
  const { subscription_id } = context.params;
  const { data: subscription } = await fetchSubscriptionById(subscription_id);

  if (!subscription) {
    return {
      notFound: true,
    };
  }

  if (subscription.status === "active") {
    return {
      redirect: {
        destination: `/subscription/${subscription_id}/success`,
        permanent: false,
      },
    };
  }

  const { data: client } = await fetchClientById(subscription.client_id);
  const { data: coach } = await fetchCoachById(client.coach_id);

  return {
    props: {
      subscription,
      client,
      coach,
    },
  };
}

export default withAuth(SubscriptionPage, ["anonymous"]);
