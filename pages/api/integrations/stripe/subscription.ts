import { stripe } from "@/initializers/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeSubscriptionSchedule } from "@/integrations/stripe/subscriptionSchedule";
import { create as createStripeSubscription } from "@/integrations/stripe/subscription";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      customerId,
      priceId,
      quantity,
      metadata,
      trialPeriodDays,
      startDate,
    } = req.body;

    // Check if the start date is in the future
    if (startDate && new Date(startDate) > new Date()) {
      let trialEndDate = new Date(startDate);
      trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

      const subscriptionSchedule = await createStripeSubscriptionSchedule(
        stripe,
        {
          customerId,
          startDate: new Date(startDate),
          trialPeriodDays,
          priceId,
          quantity,
          metadata,
        }
      );

      res.status(200).json(subscriptionSchedule);
    } else {
      // Create the subscription
      const subscription = await createStripeSubscription(stripe, {
        customerId,
        priceId,
        quantity,
        metadata,
        trialPeriodDays,
      });

      res.status(200).json(subscription);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
