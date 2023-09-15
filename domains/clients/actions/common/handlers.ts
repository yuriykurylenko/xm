import StripeApi from "stripe";

import {
  fetchClientById,
  fetchCoachByClientId,
  fetchSubscriptionsByClientId,
  updateClientSubscriptionById,
} from "@/app/utils/api";
import { updateStripeSubscription } from "@/app/utils/api/stripe";
import { UUID } from "crypto";

export const changePriceOrRenewSubscription = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
  }: {
    monthlyAmount: number;
    currency: string;
  },
  { stripe }: { stripe: StripeApi }
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);
  const { data: client } = await fetchClientById(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);

  if (!subscriptions?.length) {
    return { data: null, error: { message: "Client subscription not found" } };
  }

  const subscription = subscriptions?.[0];

  try {
    await updateStripeSubscription(
      {
        stripeSubscriptionId: subscription.stripe_subscription_id,
        monthlyAmount: monthlyAmount * 100,
        currency,
        isActiveSubscription: true,
      },
      stripe
    );

    await updateClientSubscriptionById(subscription.id, {
      monthly_amount: monthlyAmount * 100,
      currency,
    });

    return { data: client, error: null };
  } catch (e) {
    return { data: null, error: { message: "Error updating client terms" } };
  }
};
