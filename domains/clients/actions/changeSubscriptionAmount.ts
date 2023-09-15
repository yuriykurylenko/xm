import StripeApi from "stripe";

import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { PriceField } from "@/domains/clients/components/DialogForms/PriceField";

import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import {
  fetchClientById,
  fetchCoachByClientId,
  fetchSubscriptionsByClientId,
  updateClientSubscriptionById,
} from "@/app/utils/api";
import { updateStripeSubscription } from "@/app/utils/api/stripe";

const changeClientPrice = async (
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

const changeSubscriptionAmount: Action<Client> = {
  name: "changeSubscriptionAmount",
  title: "Change client's monthly price",
  titleBulk: "Change price",
  icon: faDollarSign,
  show: (client: Client) =>
    client.status === "client" && client.end_date === null,
  apiOperation: "changeSubscriptionAmount",
  apiHandler: changeClientPrice,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    PriceField({ items, coach: user as Coach }),
  dialogTitle: "Change price for {{full_name}}",
  dialogTitleBulk: "Change price for {{n}} clients",
  dialogText: "Please specify the new price for {{full_name}}.",
  dialogTextBulk: "Please specify the new price for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email confirming the change of the terms but would not need to add their credit card again.",
  dialogInfoTextBulk:
    "Your clients will receive an email confirming the change of the terms but would not need to add their credit card again.",
};

export default changeSubscriptionAmount;
