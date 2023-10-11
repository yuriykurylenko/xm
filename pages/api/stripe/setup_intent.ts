import { stripe } from "@/initializers/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeSetupIntent } from "@/integrations/stripe/setupIntent";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { email } = req.body;

      const setupIntent = await createStripeSetupIntent(stripe, {
        email,
      });

      res.status(200).send({
        client_secret: setupIntent.client_secret,
        customer_id: setupIntent.customer,
      });
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;
