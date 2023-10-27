import { NextApiRequest, NextApiResponse } from "next";
import { UUID } from "crypto";
import { stripe } from "@/integrations/stripe/initializer";
import sgMail from "@/initializers/sgMail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).end("Method Not Allowed");
  }

  const { domain, id, action } = req.query;
  const data = req.body;

  try {
    // TODO: ensure domain path can be used
    const { handler } = await import(`@/domains/${domain}/actions/${action}`);

    if (!handler) {
      return res.status(404).end("Not Found");
    }

    const { data: client, error } = await handler(id as UUID, data, {
      stripe,
      sgMail,
    });
    return error
      ? res.status(500).json({ error })
      : res.status(200).json(client);
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: "An unexpected error occurred" } });
  }
}
