import { stripe } from "@/initializers/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { create as attachStripePaymentMethodToCustomer } from "@/integrations/stripe/customerPaymentMethod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { customerId, paymentMethodId } = req.body;

    const paymentMethod = await attachStripePaymentMethodToCustomer(stripe, {
      paymentMethodId,
      customerId,
    });

    res.status(200).json(paymentMethod);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
