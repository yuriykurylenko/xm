import { stripe } from "@/initializers/stripe";

import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeProductForCoach } from "@/integrations/stripe/product";
import { update as updateCoachById } from "@/domains/coaches/model";
import { fetch as fetchCoachById } from "@/domains/coaches/model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { coach_id } = req.body;

    if (!coach_id) {
      return res
        .status(400)
        .json({ error: "Missing coach_id in request body" });
    }

    const { data: coach, error: coachError } = await fetchCoachById(coach_id);

    if (coachError || !coach) {
      return res.status(404).json({ error: "Coach not found" });
    }

    const { data: product } = await createStripeProductForCoach(stripe, {
      name: `${coach.full_name} - coaching subscription`,
    });

    const { error: updateError } = await updateCoachById(coach_id, {
      stripe_product_id: product.id,
    });

    if (updateError) {
      return res.status(500).json({ error: "Failed to update coach" });
    }

    return res
      .status(200)
      .json({ message: "Stripe product created successfully" });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
