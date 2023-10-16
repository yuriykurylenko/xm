import * as React from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { JSX } from "react";
import { handleCardAndSubscriptionSetup as handleStripeCardAndSubscriptionSetup } from "@/integrations/stripe";

import styles from "@/app/components/Form/styles.module.css";
import Form from "@/app/components/Form";
import Button from "@/app/components/Form/Button";
import { UUID } from "crypto";

const stripePromise = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);

interface CheckoutFormProps {
  stripePriceId?: string;
  customerEmail: string;
  customerFullName: string;
  subscriptionId: UUID;
  trialPeriodDays: number;
  startDate?: Date;
  onSubscriptionSuccess: () => void;
}

const CheckoutForm = (props: JSX.IntrinsicAttributes & CheckoutFormProps) => (
  <Elements stripe={stripePromise}>
    <CheckoutFormContent {...props} />
  </Elements>
);

const CheckoutFormContent = ({
  stripePriceId,
  customerEmail,
  customerFullName,
  subscriptionId,
  trialPeriodDays,
  startDate,
  onSubscriptionSuccess,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  async function onSubmit() {
    try {
      if (stripe) {
        const { data: subscriptionData, error } =
          await handleStripeCardAndSubscriptionSetup(
            stripe,
            elements?.getElement(CardElement) || null,
            {
              stripePriceId,
              email: customerEmail,
              name: customerFullName,
              metadata: {
                subscription_id: subscriptionId,
              },
              trialPeriodDays,
              startDate,
            }
          );

        if (subscriptionData?.success) {
          onSubscriptionSuccess();
          return { data: subscriptionData, error };
        }

        if (error) {
          return { data: subscriptionData, error };
        }
      }
    } catch (error) {
      return {
        data: null,
        error: { message: "Error confirming subscription" },
      };
    }
  }

  const startsNow = !startDate || new Date(startDate) <= new Date();

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
      <Button type="submit" submittingText="Processing...">
        {trialPeriodDays === 0 && startsNow ? "Pay" : "Add card"}
      </Button>
    </Form>
  );
};

export default CheckoutForm;
