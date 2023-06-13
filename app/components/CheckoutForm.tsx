import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { JSX } from "react";
import { handleStripeCardAndSubscriptionSetup } from "@/app/utils/api/stripe";

import styles from "@/app/components/Form/styles.module.css";
import Form from "@/app/components/Form";
import Button from "@/app/components/Form/Button";

const stripePromise = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);

interface CheckoutFormProps {
  clientEmail: string;
  clientFullName: string;
  monthlyAmount: number;
  onSubscriptionSuccess: (stripeSubscritionId: string) => void;
}

const CheckoutForm = (props: JSX.IntrinsicAttributes & CheckoutFormProps) => (
  <Elements stripe={stripePromise}>
    <CheckoutFormContent {...props} />
  </Elements>
);

const CheckoutFormContent = ({
  clientEmail,
  clientFullName,
  monthlyAmount,
  onSubscriptionSuccess,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  async function onSubmit() {
    try {
      const { data: subscriptionData, error } =
        await handleStripeCardAndSubscriptionSetup(
          stripe,
          elements?.getElement(CardElement),
          { email: clientEmail, full_name: clientFullName },
          { monthly_amount: monthlyAmount }
        );

      if (subscriptionData?.success) {
        onSubscriptionSuccess(subscriptionData.stripeSubscriptionId);
        return { data: subscriptionData, error };
      }

      if (error) {
        return { data: subscriptionData, error };
      }
    } catch (error) {
      return {
        data: null,
        error: { message: "Error confirming subscription" },
      };
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
      <Button type="submit" submittingText="Processing...">
        Pay
      </Button>
    </Form>
  );
};

export default CheckoutForm;
