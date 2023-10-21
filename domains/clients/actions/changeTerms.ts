import { Action } from "@/types/action";
import { Client } from "@/types/user";
import { ClientTermsFormFields } from "@/domains/clients/actions/common/components/DialogForms/TermsFields";

import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import { startOfUtcDay } from "@/app/utils/dateTime";
import { fetch as fetchClientById } from "@/domains/clients/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";
import {
  create as createSubscription,
  fetchByClientId as fetchSubscriptionByClientId,
} from "@/domains/clients/domains/subscriptions/model";
import { findOrCreate as findOrCreateStripePrice } from "@/integrations/stripe/models/price";
import { cancel as cancelStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { create as createStripeSubscriptionSchedule } from "@/integrations/stripe/models/subscriptionSchedule";
import { onComplete } from "@/domains/clients/actions/common/handlers";

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
  }
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
  const { data: client } = await fetchClientById(clientId);

  const { data: clientSubscription, error } = await createSubscription(
    clientId,
    {
      monthlyAmount: monthlyAmount,
      currency,
      trialPeriodDays: trialPeriodDays ? trialPeriodDays : trialPeriod ? 14 : 0,
      startDate: utcStartDate,
    }
  );

  if (error) {
    return { data: client, error };
  }

  const { customer } = await cancelStripeSubscriptionSchedule(
    subscription?.stripe_subscription_id
  );

  const price = await findOrCreateStripePrice({
    productId: coach?.stripe_product_id,
    unitAmount: monthlyAmount * 100,
    interval: "month",
    currency,
  });

  await createStripeSubscriptionSchedule({
    customerId: customer,
    startDate: new Date(utcStartDate),
    trialPeriodDays,
    priceId: price.id,
    quantity: 1,
    metadata: {
      subscription_id: clientSubscription?.id,
      updated: true,
    },
  });

  return { data: client, error };
};

const changeTermsAction: Action<Client> = {
  title: "Change client's terms",
  titleBulk: "Change terms",
  icon: faRotate,
  show: (client: Client) => client.status === "starting",
  apiHandler,
  onComplete,
  DialogForm: ({ items, values }: { items: Client[]; values: any }) =>
    ClientTermsFormFields({ items, values }),
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
