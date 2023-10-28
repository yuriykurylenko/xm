import { MailService } from "@sendgrid/mail";

import {
  create as createClientSubscription,
  fetchAllByClientId as fetchSubscriptionsByClientId,
  update as updateSubscriptionById,
  fetch as fetchSubscriptionById,
} from "@/domains/clients/domains/subscriptions/model";

import {
  fetchBy as fetchClientBy,
  fetch as fetchClientById,
  update as updateClientById,
} from "@/domains/clients/model";
import { fetchByClientId as fetchCoachByClientId } from "@/domains/coaches/model";

import { update as updateStripeSubscription } from "@/integrations/stripe/models/subscription";
import { UUID } from "crypto";
import { Subscription } from "@/types/subscription";
import { Client } from "@/types/user";
import router from "next/router";

export const changePriceOrRenewSubscription = async (
  subscriptionId: UUID,
  {
    monthly_amount,
    currency = "USD",
  }: {
    monthly_amount: number;
    currency: string;
  }
) => {
  const { data: subscription } = await fetchSubscriptionById(subscriptionId);

  try {
    await updateStripeSubscription(subscription?.stripe_subscription_id, {
      monthlyAmount: monthly_amount * 100,
      currency,
      isActiveSubscription: true,
    });

    await updateSubscriptionById(subscription?.id, {
      monthly_amount: monthly_amount * 100,
      currency,
    });

    return { data: subscription, error: null };
  } catch (e) {
    return {
      data: subscription,
      error: { message: "Error updating client terms" },
    };
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
    monthly_amount,
    currency = "USD",
    trial_period_days,
    trial_period,
    start_date,
  }: {
    monthly_amount: number;
    currency: string;
    trial_period_days?: number;
    trial_period?: boolean;
    start_date?: Date | string | null;
  },
  { sgMail }: { sgMail: MailService }
) => {
  const { data: subscription, error: subscriptionError } =
    await createClientSubscription(clientId as UUID, {
      monthly_amount,
      currency,
      trial_period_days: trial_period_days || (trial_period ? 14 : 0),
      start_date,
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

export const onComplete = (client: Client) =>
  router.push(`?status=${client.status as string}`);
