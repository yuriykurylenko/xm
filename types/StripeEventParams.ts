import Stripe from "stripe";
import { Subscription } from "@/types/subscription";
import { Client } from "@/types/user";

export type StripeEventParams = {
  stripeEventType: string;
  stripeEventPreviousAttributes: any;
  stripeSubscription: Stripe.Subscription;
  stripeInvoice: Stripe.Invoice;
  stripeCharge?: Stripe.Charge;
  subscription: Subscription;
  client: Client;
};
