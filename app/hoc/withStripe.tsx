import React from "react";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { stripeClient } from "@/initializers/stripe";

export const withStripe = (Component: React.FC<any>) => {
  const WrappedComponent = (props: any) => {
    const stripe = useStripe();
    const elements = useElements();

    return (
      <Elements stripe={stripeClient}>
        <Component
          {...props}
          stripe={stripe}
          elements={elements}
          CardElement={CardElement}
        />
      </Elements>
    );
  };
  WrappedComponent.displayName = `withStripe(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};
