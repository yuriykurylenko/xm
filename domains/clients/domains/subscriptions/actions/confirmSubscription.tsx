import React from "react";
import { CardElement } from "@stripe/react-stripe-js";
import styles from "@/app/components/Form/styles.module.css";
import { Action } from "@/types/action";
import { Subscription } from "@/types/subscription";
import router from "next/router";

import { activate as activateClient } from "@/domains/clients/model";
import { UUID } from "crypto";

const FormComponent = () => (
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
);

const confirmSubscriptionAction: Action<Subscription> = {
  title: "Pay",
  show: (subscription: Subscription) =>
    !subscription.start_date || new Date(subscription.start_date) <= new Date(),
  Form: FormComponent,
  onComplete: async (subscription: Subscription) => {
    await activateClient(subscription.id);
    router.push(`/subscription/${subscription.id}/success`);
  },
};

export default confirmSubscriptionAction;
