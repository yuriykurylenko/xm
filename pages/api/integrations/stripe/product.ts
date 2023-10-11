import { stripe } from "@/initializers/stripe";

import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeProductForCoach } from "@/integrations/stripe/product";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Missing product name in request body" });
    }

    const { data: product } = await createStripeProductForCoach(stripe, {
      name,
    });

    return res.status(200).json(product);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
