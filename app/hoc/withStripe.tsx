import React from "react";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { stripeClient } from "@/initializers/stripe";

export const withStripe = (Component: React.FC<any>) => {
  const IntermediaryComponent = (props: any) => {
    const stripe = useStripe();
    const elements = useElements();

    return (
      <Component
        {...props}
        stripe={stripe}
        elements={elements}
        CardElement={CardElement}
      />
    );
  };

  const WrappedComponent = (props: any) => {
    return (
      <Elements stripe={stripeClient}>
        <IntermediaryComponent {...props} />
      </Elements>
    );
  };
  WrappedComponent.displayName = `withStripe(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};
