import * as React from "react";
import { handleCardAndSubscriptionSetup as handleStripeCardAndSubscriptionSetup } from "@/integrations/stripe";

import styles from "@/app/components/Form/styles.module.css";
import Form from "@/app/components/Form";
import Button from "@/app/components/Form/Button";
import { UUID } from "crypto";
import { withStripe } from "@/app/hoc/withStripe";

interface CheckoutFormProps {
  stripePriceId?: string;
  customerEmail: string;
  customerFullName: string;
  subscriptionId: UUID;
  trialPeriodDays: number;
  startDate?: Date;
  onSubscriptionSuccess: () => void;
  stripe: any;
  elements: any;
  CardElement: any;
}

const CheckoutForm = ({
  stripePriceId,
  customerEmail,
  customerFullName,
  subscriptionId,
  trialPeriodDays,
  startDate,
  onSubscriptionSuccess,
  stripe,
  elements,
  CardElement,
}: CheckoutFormProps) => {
  const onSubmit = async () => {
    try {
      if (stripe) {
        const { data, error } = await handleStripeCardAndSubscriptionSetup(
          {
            stripePriceId,
            email: customerEmail,
            name: customerFullName,
            metadata: {
              subscription_id: subscriptionId,
            },
            trialPeriodDays,
            startDate,
          },
          {
            stripe,
            StripeCardElementInstance:
              elements?.getElement(CardElement) || null,
          }
        );

        if (data?.success) {
          onSubscriptionSuccess();
        }

        return { data, error };
      }
    } catch (error) {
      return {
        data: null,
        error: { message: "Error confirming subscription" },
      };
    }
  };

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

export default withStripe(CheckoutForm);
