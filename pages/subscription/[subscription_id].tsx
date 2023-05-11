import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/subscriptionPage.module.css";
import "@/app/globals.css";

import axios from "axios";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeCardElement } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

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
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        stripe_subscription_id: stripeSubscriptionId,
        status: "active",
      })
      .eq("id", subscription.id);

    if (subscriptionError) {
      return;
    }

    // Update client status in Supabase
    await supabase
      .from("clients")
      .update({ status: "client" })
      .eq("id", client.id);
  };

  async function handleSubmit(event: any) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Get the client secret from the server
    const {
      data: { client_secret, customer_id },
    } = await axios.post("/api/setup_intents", {
      email: (client as any).email,
    });

    // Confirm card setup
    const result = await stripe?.confirmCardSetup(client_secret, {
      payment_method: {
        card: elements?.getElement(CardElement) as StripeCardElement,
        billing_details: {
          name: client.full_name,
        },
      },
    });

    if (result?.error) {
      setError(result?.error?.message);
      setLoading(false);
    } else {
      try {
        const response = await axios.post("/api/subscription", {
          customerId: customer_id,
          paymentMethodId: result?.setupIntent?.payment_method,
          priceId: "price_1N6JeAA4j0lnvK9GaP833Peg",
          quantity: subscription.monthly_amount / 100,
        });

        const { status, last_payment_error } =
          response.data.latest_invoice.payment_intent;

        if (status === "succeeded") {
          updateSubscriptionInDatabase(response.data.id);
          router.push(`/subscription/${subscription.id}/success`);
        } else if (last_payment_error) {
          setError(last_payment_error.message);
        }
      } catch (error) {
        setError("Error creating subscription");
      } finally {
        setLoading(false);
      }
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
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", subscription.client_id);

    const { data: coachData } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", clientData[0]?.coach_id);

    setClient(clientData[0]);
    setCoach(coachData[0]);
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

  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscription_id);

  const subscription = subscriptionData?.[0];

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
