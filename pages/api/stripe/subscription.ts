import { stripe } from "@/initializers/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeSubscriptionSchedule } from "@/integrations/stripe/subscriptionSchedule";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      customerId,
      paymentMethodId,
      priceId,
      quantity,
      metadata,
      trialPeriodDays,
      startDate,
    } = req.body;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the default payment method on the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

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
          quantity: 1,
          metadata,
        }
      );

      res.status(200).json(subscriptionSchedule);
    } else {
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId, quantity }],
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
