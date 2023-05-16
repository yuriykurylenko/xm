import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import { fetchClientById, fetchCoachByClientId } from "@/app/utils/api";

const formatAmount = (amount: number, currency: string) => {
  const formattedAmount = Number((amount / 100).toFixed(2));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(formattedAmount);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  const { subscription, domain } = req.body;

  const formattedSubscriptionAmount = formatAmount(
    subscription?.monthly_amount,
    subscription.currency
  );

  try {
    const { data: client, error: clientError } = await fetchClientById(subscription.client_id);
    const { data: coach, error: coachError } = await fetchCoachByClientId(subscription.client_id);

    const msg = {
      to: client.email,
      from: "yuriy.kurylenko@gmail.com",
      subject: `Confirm your coaching subscription with ${coach.full_name}`,
      text: `Coaching subscription with ${
        coach.full_name
      }\n\n${formattedSubscriptionAmount}Dear ${
        client.full_name
      },\n\nThank you so much for signing up for coaching. You will be paying ${
        subscription.amount / 100
      } ${
        subscription.currency
      } monthly. Please confirm your subscription by clicking the following link: ${domain}/subscription/${
        subscription.id
      }`,
      html: `
      <div border-radius: 10px; style="margin: 0 auto; max-width: 400px; background-color: #f1f1f1; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Coaching subscription with ${coach.full_name}</h2>
        <p>Dear ${client.full_name}, <br/> Thank you so much for signing up for coaching.</p>
        <p>You will be paying ${formattedSubscriptionAmount} monthly.</p>
        <div style="margin: 20px 0;">
          <a href="${domain}/subscription/${subscription.id}" style="display: inline-block; width: 100%; padding: 10px 0; background-color: #7c9efc; color: #FFFFFF; text-align: center; text-decoration: none; font-size: 14px; border-radius: 5px;">Confirm Subscription</a>
        </div>
      </div>
      `,
    };

    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    if ((error as any).response) {
      console.error((error as any).response.body);
    }
    res.status(500).json({ success: false, error });
  }
}
