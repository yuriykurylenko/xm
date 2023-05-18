import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { JSX, SetStateAction, useState } from "react";
import { handleStripeCardAndSubscriptionSetup } from "../utils/api";

import styles from "@/app/styles/subscriptionPage.module.css";

const stripePromise = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);

const CheckoutForm = (
  props: JSX.IntrinsicAttributes & {
    client: any;
    subscription: any;
    onSubscriptionSuccess: (stripeSubscritionId: string) => void;
  }
) => (
  <Elements stripe={stripePromise}>
    <CheckoutFormContent {...props} />
  </Elements>
);

const CheckoutFormContent = ({
  client,
  subscription,
  onSubscriptionSuccess,
}: {
  client: any;
  subscription: any;
  onSubscriptionSuccess: (stripeSubscritionId: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] =
    useState<SetStateAction<null | undefined | string>>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: any) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: subscriptionData, error } =
        await handleStripeCardAndSubscriptionSetup(
          stripe,
          elements?.getElement(CardElement),
          { email: client.email, full_name: client.full_name },
          { monthly_amount: subscription.monthly_amount }
        );

      if (subscriptionData?.success) {
        onSubscriptionSuccess(subscriptionData.stripeSubscriptionId);
      }

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (error) {
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
};

export default CheckoutForm;
