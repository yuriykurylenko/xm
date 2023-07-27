import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import { fetchClientById, fetchCoachByClientId } from "@/app/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  const { subscription, domain } = req.body;

  try {
    const { data: client } = await fetchClientById(subscription.client_id);
    const { data: coach } = await fetchCoachByClientId(subscription.client_id);

    if (client && coach) {
      await sgMail.send({
        to: client.email,
        from: "yuriy.kurylenko@gmail.com",
        templateId: "d-cd682145f2884174bd1721ac483355b9",
        dynamicTemplateData: {
          client_name: client?.full_name,
          coach_name: coach?.full_name,
          amount: subscription.monthly_amount / 100,
          currency: subscription.currency,
          payment_link: `${domain}/subscription/${subscription.id}`,
        },
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
}
