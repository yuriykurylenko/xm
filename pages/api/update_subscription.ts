import {
  fetchClientById,
  fetchCoachByClientId,
  fetchSubscriptionByStripeSubscriptionId,
} from "@/app/utils/api";
import { findOrCreateStripePrice } from "@/app/utils/api/stripe";
import { stripe } from "@/app/utils/initStripe";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      metadata,
      monthlyAmount,
      currency,
      trialPeriodDays,
      startDate,
      stripeSubscriptionId,
    } = req.body;

    const { data: subscription } =
      await fetchSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    const { data: coach } = await fetchCoachByClientId(subscription?.client_id);

    const price = await findOrCreateStripePrice(stripe, {
      product: coach?.stripe_product_id,
      unit_amount: monthlyAmount,
      interval: "month",
      currency,
    });

    const canceledSchedule = await stripe.subscriptionSchedules.cancel(
      stripeSubscriptionId
    );

    // Check if the start date is in the future
    if (startDate && new Date(startDate) > new Date()) {
      let trialEndDate = new Date(startDate);
      trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

      const subscriptionSchedule = await stripe.subscriptionSchedules.create({
        customer: canceledSchedule.customer as string,
        start_date: Math.floor(new Date(startDate).getTime() / 1000),
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
                metadata: { ...metadata, updated: true },
              },
            ],
            metadata: { ...metadata, updated: true },
          },
        ],
        metadata: { ...metadata, updated: true },
      });

      res.status(200).json(subscriptionSchedule);
    } else {
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: canceledSchedule.customer as string,
        items: [{ price: price.id, quantity: 1 }],
        expand: ["latest_invoice.payment_intent"],
        metadata,
        trial_period_days: trialPeriodDays,
      });

      res.status(200).json(subscription);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
