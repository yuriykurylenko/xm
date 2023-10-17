import { MailService } from "@sendgrid/mail";

import {
  create as createClientSubscription,
  fetchAllByClientId as fetchSubscriptionsByClientId,
  update as updateSubscriptionById,
} from "@/domains/clients/domains/subscriptions/model";

import {
  fetch as fetchClientById,
  update as updateClientById,
} from "@/domains/clients/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";

import { update as updateStripeSubscription } from "@/integrations/stripe/subscription";
import { UUID } from "crypto";
import { Subscription } from "@/types/subscription";
import { Client } from "@/types/user";

export const changePriceOrRenewSubscription = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
  }: {
    monthlyAmount: number;
    currency: string;
  }
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
    await updateStripeSubscription(subscription.stripe_subscription_id, {
      monthlyAmount: monthlyAmount * 100,
      currency,
      isActiveSubscription: true,
    });

    await updateSubscriptionById(subscription.id, {
      monthly_amount: monthlyAmount * 100,
      currency,
    });

    return { data: client, error: null };
  } catch (e) {
    return { data: client, error: { message: "Error updating client terms" } };
  }
};

const sendPaymentLink = async (
  subscription: Subscription,
  sgMail: MailService
) => {
  const { data: client } = await fetchClientById(subscription.client_id);
  const { data: coach } = await fetchCoachByClientId(subscription.client_id);

  if (client && coach) {
    await sgMail.send({
      to: client.email,
      from: "yuriy.kurylenko@gmail.com",
      templateId: "d-cd682145f2884174bd1721ac483355b9",
      dynamicTemplateData: {
        client_name: client?.full_name,
        coach_name: coach?.full_name,
        amount: subscription.monthly_amount / 100,
        currency: subscription.currency,
        payment_link: `https://coaching-ten.vercel.app/subscription/${subscription.id}`,
        trial_period_days: subscription.trial_period_days,
        start_date:
          !subscription.start_date ||
          new Date(subscription.start_date) < new Date()
            ? new Date()
            : new Date(subscription.start_date),
      },
    });
  }
};

export const sendOffer = async (
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
    startDate?: Date | string | null;
  },
  { sgMail }: { sgMail: MailService }
) => {
  const { data: subscription, error: subscriptionError } =
    await createClientSubscription(clientId as UUID, {
      monthlyAmount,
      currency,
      trialPeriodDays: trialPeriodDays || (trialPeriod ? 14 : 0),
      startDate,
    });

  if (subscriptionError) {
    return { subscription, error: { message: "Error creating subscription" } };
  }

  if (subscription) {
    await sendPaymentLink(subscription as Subscription, sgMail);
  }

  const { data, error } = await updateClientById(clientId as UUID, {
    status: "offerSent",
  });
  return { data, error };
};

export const onComplete = (
  client: Client,
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus(client.status as string);
