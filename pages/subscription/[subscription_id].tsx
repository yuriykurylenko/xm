import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/app/styles/subscriptionPage.module.css";
import "@/app/globals.css";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Head from "next/head";
import {
  activateClientSubscription,
  confirmStripeCardSetup,
  createStripeSetupIntent,
  createStripeSubscription,
  createSubscription,
  fetchClientById,
  fetchCoachById,
  fetchSubscriptionById,
  updateClientById,
} from "@/app/utils/api";

function CheckoutForm({
  client,
  subscription,
}: {
  client: any;
  subscription: any;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] =
    useState<SetStateAction<null | undefined | string>>(null);
  const [loading, setLoading] = useState(false);

  const updateSubscriptionInDatabase = async (stripeSubscriptionId: any) => {
    // Update subscription in Supabase
    const { error } = await activateClientSubscription(
      subscription.id,
      stripeSubscriptionId
    );

    if (error) {
      return;
    }

    // Update client status in Supabase
    await updateClientById(client.id, { status: "client" });
  };

  async function handleSubmit(event: any) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Get the client secret from the server
    const {
      data: { client_secret, customer_id },
    } = await createStripeSetupIntent({
      email: (client as any).email,
    });

    try {
      const { data: setupIntent, error } = await confirmStripeCardSetup(
        stripe,
        elements?.getElement(CardElement),
        client_secret,
        {
          name: client.full_name,
        }
      );

      if (error) {
        // Display error.message in your UI.
        setError(error.message);
        setLoading(false);
        return;
      }

      if (setupIntent && setupIntent.status === "succeeded") {
        const { data: subscriptionData, error } = await createSubscription(
          stripe,
          customer_id,
          setupIntent.payment_method,
          { monthly_amount: subscription.monthly_amount }
        );

        if (subscriptionData?.success) {
          updateSubscriptionInDatabase(subscriptionData.stripeSubscriptionId);
          router.push(`/subscription/${subscription.id}/success`);
        }

        if (error) {
          setError(error.message);
          setLoading(false);
        }
      }
    } catch (error) {
      // Handle any other errors.
      setError("Error creating subscription");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles["card-element-container"]}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#707070",
                },
                backgroundColor: "#F0F8FF",
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        className="submit-btn pay-btn"
        disabled={!stripe || loading}
      >
        {loading ? "Processing..." : "Pay"}
      </button>
      {error && (
        <div className={styles["error-message"]}>
          <>{error}</>
        </div>
      )}
    </form>
  );
}

const SubscriptionPage = ({ subscription }: { subscription: any }) => {
  const [client, setClient] = useState(null);
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    fetchClientAndCoach();
  }, []);

  async function fetchClientAndCoach() {
    const { data: clientData } = await fetchClientById(subscription.client_id);
    const { data: coachData } = await fetchCoachById(clientData.coach_id);

    setClient(clientData);
    setCoach(coachData);
  }

  // Helper function to format the subscription amount
  const formatAmount = (amount: number, currency: string) => {
    const formattedAmount = Number((amount / 100).toFixed(2));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(formattedAmount);
  };

  return (
    <Elements stripe={stripePromise}>
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
          <CheckoutForm client={client} subscription={subscription} />
        </div>
      </div>
    </Elements>
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

  return {
    props: {
      subscription,
    },
  };
}

export default SubscriptionPage;
