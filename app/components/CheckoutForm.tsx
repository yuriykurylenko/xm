import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { JSX, SetStateAction, useState } from "react";
import { handleStripeCardAndSubscriptionSetup } from "../utils/api/stripe";

import styles from "@/app/components/Form/styles.module.css";
import Form from "@/app/components/Form";
import Button from "@/app/components/Form/Button";

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
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);

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
        setSubmitting(false);
      }
    } catch (error) {
      setError("Error creating subscription");
      setSubmitting(false);
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <div className={styles["input-container"]}>
        <div className={styles["input"]}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#707070",
                  },
                  backgroundColor: "#fafafa",
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={submitting}
        error={(error as string) || ""}
      >
        {submitting ? "Processing..." : "Pay"}
      </Button>
    </Form>
  );
};

export default CheckoutForm;
