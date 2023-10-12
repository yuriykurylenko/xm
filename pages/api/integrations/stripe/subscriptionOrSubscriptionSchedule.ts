import { stripe } from "@/initializers/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeSubscriptionOrSubscriptionSchedule } from "@/integrations/stripe/subscriptionOrSubscriptionSchedule";

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

    const subscriptionOrSubscriptionSchedule =
      await createStripeSubscriptionOrSubscriptionSchedule(stripe, {
        customerId,
        startDate,
        priceId,
        quantity,
        metadata,
        trialPeriodDays,
      });

    res.status(200).json(subscriptionOrSubscriptionSchedule);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
