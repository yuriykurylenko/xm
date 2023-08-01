import { updateClientSubscriptionByStripeSubscriptionId } from "@/app/utils/api";
import { stripe } from "@/app/utils/initStripe";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { stripeSubscriptionId, endImmediately } = req.body;

      // Cancel the subscription in Stripe
      const canceledSubscription = endImmediately
        ? await stripe.subscriptions.del(stripeSubscriptionId)
        : await stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true,
          });

      //   await updateClientSubscriptionByStripeSubscriptionId(
      //     stripeSubscriptionId,
      //     {
      //       end_date: new Date(deletedSubscription.current_period_end * 1000),
      //     }
      //   );

      res.status(200).json(canceledSubscription);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;
