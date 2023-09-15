import StripeApi from "stripe";

import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { PriceField } from "@/domains/clients/components/DialogForms/PriceField";

import { faRotate } from "@fortawesome/free-solid-svg-icons";
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

const renewSubscription: Action<Client> = {
  name: "renewSubscription",
  title: "Renew client's subscription",
  titleBulk: "Renew subscriptions",
  icon: faRotate,
  show: (client: Client) =>
    client.status === "client" && client.end_date != null,
  apiOperation: "renewSubscription",
  apiHandler: changeClientPrice,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    PriceField({ items, coach: user as Coach }),
  dialogTitle: "Renew {{full_name}}'s subscription",
  dialogTitleBulk: "Renew {{n}} clients' subscriptions",
  dialogText: "Please specify the new price for {{full_name}} if applies.",
  dialogTextBulk: "Please specify the new price for your clients if applies.",
  dialogInfoText:
    "Your client's subscription will be renewed. You can specify the new price for {{full_name}}. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
  dialogInfoTextBulk:
    "Your clients' subscriptions will be renewed. You can specify the new price for them. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
};

export default renewSubscription;
