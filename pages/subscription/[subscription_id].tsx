import styles from "@/app/styles/subscription.module.css";
import "@/app/globals.css";

import Head from "next/head";
import {
  activateClient,
  fetchClientById,
  fetchCoachById,
  fetchSubscriptionById,
} from "@/app/utils/api";
import CheckoutForm from "@/app/components/CheckoutForm";
import router from "next/router";

const SubscriptionPage = ({
  subscription,
  client,
  coach,
}: {
  subscription: any;
  client: any;
  coach: any;
}) => {
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
          {(coach as any)?.full_name
            ? `${(coach as any)?.full_name} | Confirm subscription`
            : "Loading..."}
        </title>
      </Head>
      <div className={styles["subscription-page"]}>
        <div className={styles["subscription-container"]}>
          <h1 className={styles["header"]}>Coaching Subscription</h1>
          <div className={styles["content"]}>
            Dear <b>{(client as any)?.full_name}</b>, you will now start a
            coaching subscription with me. Please enter your payment details in
            the form below. You will be paying{" "}
            <b>
              {formatAmount(
                subscription?.monthly_amount,
                subscription.currency
              )}
            </b>{" "}
            monthly. Can&apos;t wait to get started!
            <p className={styles["signature"]}>
              Sincerely, <br />
              {(coach as any)?.full_name}
            </p>
          </div>
          <CheckoutForm
            client={client}
            subscription={subscription}
            onSubscriptionSuccess={onSubscriptionSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: {
  params: { subscription_id: any };
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

export default SubscriptionPage;
