import { updateClientSubscriptionByStripeSubscriptionId } from "@/app/utils/api";
import { stripe } from "@/app/utils/initStripe";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { stripeSubscriptionId } = req.body;

      // Cancel the subscription in Stripe
      const deletedSubscription = await stripe.subscriptions.del(
        stripeSubscriptionId
      );

      await updateClientSubscriptionByStripeSubscriptionId(
        stripeSubscriptionId,
        {
          end_date: new Date(deletedSubscription.current_period_end * 1000),
        }
      );

      // Send the deleted subscription data back to the client
      res.status(200).json(deletedSubscription);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;
