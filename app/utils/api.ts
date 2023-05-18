import supabase from "@/app/utils/supabaseClient";
import { PaymentMethod } from "@stripe/stripe-js";
import axios from "axios";
import { UUID } from "crypto";

export const fetchCoachById = (id: string) =>
  supabase.from("coaches").select("*").eq("id", id).single();

export const fetchCoachBySlug = (slug: string) =>
  supabase.from("coaches").select("*").eq("slug", slug).single();

export const fetchClientById = (clientId: UUID) =>
  supabase.from("clients").select("*").eq("id", clientId).single();

export const fetchCoachByClientId = async (clientId: UUID) => {
  const { data, error } = await fetchClientById(clientId);
  if (error) {
    return { data, error };
  }
  return fetchCoachById(data.coach_id);
};

export const fetchClientsByCoachId = (coachId: UUID) =>
  supabase.from("clients").select("*").eq("coach_id", coachId);

export const fetchSubscriptionById = (subscriptionId: UUID) =>
  supabase.from("subscriptions").select("*").eq("id", subscriptionId).single();

const createClientSubscription = (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
  }: {
    monthlyAmount: number;
    currency: string;
  }
) =>
  supabase
    .from("subscriptions")
    .insert([
      {
        client_id: clientId,
        monthly_amount: monthlyAmount,
        currency,
      },
    ])
    .select();

export const updateClientById = (clientId: UUID, data: any) =>
  supabase.from("clients").update(data).eq("id", clientId);

const sendClientPaymentLink = ({
  subscription,
  domain,
}: {
  subscription: any;
  domain: string;
}) =>
  axios.post("/api/send_payment_link", {
    subscription,
    domain,
  });

export const sendClientOffer = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
  }: {
    monthlyAmount: number;
    currency: string;
  }
) => {
  const { data, error } = await createClientSubscription(clientId, {
    monthlyAmount,
    currency,
  });

  if (error) {
    return { data, error };
  }
  if (data) {
    sendClientPaymentLink({
      subscription: data[0],
      domain: `${window.location.protocol}//${window.location.host}`,
    });
  }
  return updateClientById(clientId, { status: "offerSent" });
};

const activateClientSubscription = (
  subscriptionId: UUID,
  stripeSubscriptionId: string
) =>
  supabase
    .from("subscriptions")
    .update({
      stripe_subscription_id: stripeSubscriptionId,
      status: "active",
    })
    .eq("id", subscriptionId)
    .select()
    .single();

const createStripeSetupIntent = ({ email }: { email: string }) =>
  axios.post("/api/setup_intents", { email });

const confirmStripeCardSetup = async (
  stripe: any,
  StripeCardElementInstance: any,
  stripeClientSecret: string,
  billingDetails: { name: string }
) => {
  const { setupIntent, error } = await stripe?.confirmCardSetup(
    stripeClientSecret,
    {
      payment_method: {
        card: StripeCardElementInstance,
        billing_details: billingDetails,
      },
    }
  );

  return { data: setupIntent, error };
};

const createStripeSubscription = ({
  customerId,
  paymentMethodId,
  quantity,
}: {
  customerId: string;
  paymentMethodId: string | PaymentMethod | null;
  quantity: number;
}) =>
  axios.post("/api/subscription", {
    customerId,
    paymentMethodId,
    quantity,
    priceId: "price_1N6JeAA4j0lnvK9GaP833Peg",
  });

const createAndConfirmStripeSubscription = async (
  stripe: any,
  customerId: string,
  paymentMethodId: string | PaymentMethod | null,
  { monthly_amount }: { monthly_amount: number }
) => {
  try {
    const { data: stripeSubscription } = await createStripeSubscription({
      customerId,
      paymentMethodId,
      quantity: monthly_amount / 100,
    });

    const paymentIntent = stripeSubscription.latest_invoice.payment_intent;

    if (paymentIntent.status === "succeeded") {
      return {
        data: { success: true, stripeSubscriptionId: stripeSubscription.id },
        error: null,
      };
    } else if (paymentIntent.status === "requires_action") {
      const paymentIntentResult = await stripe?.confirmCardPayment(
        paymentIntent.client_secret
      );
      if (paymentIntentResult?.error) {
        return { data: null, error: paymentIntentResult.error };
      } else if (
        paymentIntentResult?.paymentIntent &&
        paymentIntentResult.paymentIntent.status === "succeeded"
      ) {
        return {
          data: {
            success: true,
            stripeSubscriptionId: stripeSubscription.id,
          },
          error: null,
        };
      }
    } else if (paymentIntent.last_payment_error) {
      return { data: null, error: paymentIntent.last_payment_error };
    }
  } catch (error) {
    return { data: null, error: { message: "Error creating subscription" } };
  }
  return { data: null, error: null };
};

export const activateClient = async (
  subscriptionId: UUID,
  stripeSubscriptionId: string
) => {
  const { data: subscription, error } = await activateClientSubscription(
    subscriptionId,
    stripeSubscriptionId
  );

  if (error) {
    return { data: subscription, error };
  }
  await updateClientById(subscription.client_id, { status: "client" });
};

export const handleStripeCardAndSubscriptionSetup = async (
  stripe: any,
  StripeCardElementInstance: any,
  { email, full_name }: { email: string; full_name: string },
  { monthly_amount }: { monthly_amount: number }
) => {
  const {
    data: { client_secret, customer_id },
  } = await createStripeSetupIntent({
    email,
  });

  const { data: setupIntentData, error } = await confirmStripeCardSetup(
    stripe,
    StripeCardElementInstance,
    client_secret,
    {
      name: full_name,
    }
  );

  if (error) {
    return { data: setupIntentData, error };
  }

  if (setupIntentData && setupIntentData.status === "succeeded") {
    const { data: subscriptionData, error } =
      await createAndConfirmStripeSubscription(
        stripe,
        customer_id,
        setupIntentData.payment_method,
        { monthly_amount }
      );

    return { data: subscriptionData, error };
  }

  return { data: null, error };
};
