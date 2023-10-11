import { stripe } from "@/initializers/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { create as createStripeCustomer } from "@/integrations/stripe/customer";
import { create as createStripeSetupIntent } from "@/integrations/stripe/setupIntent";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { email } = req.body;

      const customer = await createStripeCustomer(stripe, { email });
      const setupIntent = await createStripeSetupIntent(stripe, {
        customerId: customer.id,
      });

      res.status(200).send({
        client_secret: setupIntent.client_secret,
        customer_id: customer.id,
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
