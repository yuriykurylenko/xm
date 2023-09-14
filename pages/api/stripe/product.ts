import { stripe } from "@/app/utils/initStripe";

import { NextApiRequest, NextApiResponse } from "next";
import { createStripeProductForCoach } from "@/app/utils/api/stripe";
import { fetchCoachById, updateCoachById } from "@/app/utils/api";
import { Coach } from "@/app/types/user";

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

    const { data: product } = await createStripeProductForCoach(
      stripe,
      coach as Coach
    );

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
