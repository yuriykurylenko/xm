import { stripe } from "@/app/utils/initStripe";

export default async (req: any, res: any) => {
  if (req.method === "POST") {
    try {
      const { email } = req.body;

      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: email,
      });

      // Create a SetupIntent for the customer
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
      });

      // Send the client secret to the client to set up the payment method
      res.status(200).send({
        client_secret: setupIntent.client_secret,
        customer_id: customer.id,
      });
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as any).message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
