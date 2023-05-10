import { useEffect, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/subscriptionPage.module.css";
import "@/app/globals.css";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeCardElement } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement as StripeCardElement,
    });

    if (error) {
      console.log("[error]", error);
    } else {
      console.log("[PaymentMethod]", paymentMethod);
    }
  };

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

      <button type="submit" className="submit-btn pay-btn" disabled={!stripe}>
        Pay
      </button>
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
          <CheckoutForm />
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

  const subscription = subscriptionData[0];

  return {
    props: {
      subscription,
    },
  };
}

export default SubscriptionPage;
