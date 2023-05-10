import { stripe } from "@/app/utils/initStripe";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const { customerId, paymentMethodId, priceId, quantity } = req.body;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the default payment method on the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId, quantity }],
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).json(subscription);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
