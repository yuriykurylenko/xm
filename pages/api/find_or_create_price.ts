import { NextApiRequest, NextApiResponse } from "next";
import { findOrCreateStripePrice } from "@/app/utils/api/stripe";
import { stripe } from "@/app/utils/initStripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { product, interval, unit_amount, currency } = req.body;

    try {
      const price = await findOrCreateStripePrice(stripe, {
        product,
        interval,
        unit_amount,
        currency,
      });

      res.status(200).json(price);
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: error });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
