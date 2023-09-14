import { sendClientOffer } from "@/app/utils/api";
import { UUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

import { stripe } from "@/initializers/stripe";
import sgMail from "@/initializers/sgMail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).end("Method Not Allowed");
  }
  const clientId = req.query.client_id;
  const offerDetails = req.body;

  try {
    const { data: client, error } = await sendClientOffer(
      clientId as UUID,
      offerDetails,
      stripe,
      sgMail
    );
    return error
      ? res.status(500).json({ error })
      : res.status(200).json({ data: client });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: "An unexpected error occurred" } });
  }
}
