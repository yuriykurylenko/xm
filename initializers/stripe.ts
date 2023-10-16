import { loadStripe } from "@stripe/stripe-js";
import { Stripe } from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

export const stripeClient = loadStripe(
  "pk_test_51N6HZNA4j0lnvK9GqLarvD4YNR2ZZJ9RG3fgSOK2xusHtHm14gy4or8hgDwT6U0TMeIuwfcYivZxOjb6nUqyzTNa00OCIYPhGm"
);
