import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripeClient } from "@/initializers/stripe";

export const withStripe = (Component: React.FC<any>) => {
  return (props: React.JSX.IntrinsicAttributes) => {
    return (
      <Elements stripe={stripeClient}>
        <Component {...props} />
      </Elements>
    );
  };
};
