import StripeApi from "stripe";

import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";
import { ClientTermsFormFields } from "@/domains/clients/actions/common/components/DialogForms/TermsFields";

import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import {
  createClientSubscription,
  fetchCoachByClientId,
  fetchSubscriptionByClientId,
  startOfUtcDay,
} from "@/app/utils/api";
import { findOrCreateStripePrice } from "@/app/utils/api/stripe";

const apiHandler = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
    trialPeriodDays,
    trialPeriod,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays?: number;
    trialPeriod?: boolean;
    startDate: Date;
  },
  { stripe }: { stripe: StripeApi }
) => {
  const utcStartDate =
    startDate && startOfUtcDay(new Date(startDate)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(startDate))
      : startOfUtcDay(new Date());

  trialPeriodDays = trialPeriodDays || (trialPeriod ? 14 : 0);

  let trialEndDate = new Date(utcStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

  const { data: subscription } = await fetchSubscriptionByClientId(clientId);
  const { data: coach } = await fetchCoachByClientId(subscription?.client_id);

  const { data: clietSubscription, error } = await createClientSubscription(
    clientId,
    {
      monthlyAmount: monthlyAmount,
      currency,
      trialPeriodDays: trialPeriodDays ? trialPeriodDays : trialPeriod ? 14 : 0,
      startDate: utcStartDate,
    },
    stripe
  );

  if (error) {
    return { data: clietSubscription, error };
  }

  const { customer } = await stripe.subscriptionSchedules.cancel(
    subscription?.stripe_subscription_id
  );

  const price = await findOrCreateStripePrice(stripe, {
    product: coach?.stripe_product_id,
    unit_amount: monthlyAmount,
    interval: "month",
    currency,
  });

  const metadata = {
    subscription_id: clietSubscription?.id,
    updated: true,
  };

  await stripe.subscriptionSchedules.create({
    // @ts-ignore
    customer,
    start_date: Math.floor(new Date(utcStartDate).getTime() / 1000),
    end_behavior: "release",
    phases: [
      {
        trial_end:
          trialPeriodDays > 0
            ? Math.floor(trialEndDate.getTime() / 1000)
            : undefined,
        items: [
          {
            price: price.id,
            quantity: 1,
            metadata,
          },
        ],
        metadata,
      },
    ],
    metadata,
  });

  return { data: clietSubscription, error };
};

const changeTermsAction: Action<Client> = {
  title: "Change client's terms",
  titleBulk: "Change terms",
  icon: faRotate,
  show: (client: Client) => client.status === "starting",
  apiOperation: "changeTerms",
  apiHandler,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    ClientTermsFormFields({ items, coach: user as Coach }),
  dialogTitle: "Change terms for {{full_name}}",
  dialogTitleBulk: "Change terms {{n}} clients",
  dialogText: "Please specify the new price and start date for {{full_name}}.",
  dialogTextBulk:
    "Please specify the new price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email confirming the change of the terms but would not need to add their credit card again.",
  dialogInfoTextBulk:
    "Your clients will receive an email confirming the change of the terms but would not need to add their credit card again.",
};

export default changeTermsAction;
