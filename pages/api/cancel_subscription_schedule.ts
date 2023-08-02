import { stripe } from "@/app/utils/initStripe";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { stripeSubscriptionScheduleId } = req.body;

      // Cancel the subscription schedule in Stripe
      const canceledSubscriptionSchedule =
        await stripe.subscriptionSchedules.cancel(stripeSubscriptionScheduleId);
      res.status(200).json(canceledSubscriptionSchedule);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;
