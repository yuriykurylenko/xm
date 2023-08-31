import { Subscription } from "@/app/types/subscription";
import { Client, Coach } from "@/app/types/user";

import sgMail from "@/app/utils/sgMail";
import events from "@/app/utils/clientEvents";

import { format } from "date-fns";

const triggerEvent = async (
  name: string,
  {
    subscription,
    client,
    coach,
  }: { subscription: Subscription; client: Client; coach: Coach },
  data?: any
) => {
  const event = events.find((e) => e.name === name);

  if (event) {
    if (event.handler) {
      await event.handler(subscription, client, coach, data);
    }

    if (event.emailTemplateId) {
      await sgMail.send({
        to: client.email,
        from: "yuriy.kurylenko@gmail.com",
        templateId: event.emailTemplateId,
        dynamicTemplateData: {
          client_name: client.full_name,
          coach_name: coach.full_name,
          subscription_id: subscription?.id,
          amount: data?.amount || subscription?.monthly_amount / 100,
          currency: data?.currency || subscription?.currency,
          trial_period_days: subscription?.trial_period_days,
          start_date: format(
            !subscription?.start_date ||
              new Date(subscription.start_date) < new Date()
              ? new Date()
              : new Date(subscription.start_date),
            "dd/MM/yyyy"
          ),
          new_price_start_date:
            subscription.current_period_end_date &&
            format(
              new Date(subscription.current_period_end_date),
              "dd/MM/yyyy"
            ),
          invoice_number: data?.invoice_number,
          hosted_invoice_url: data?.hosted_invoice_url,
        },
      });
    }
  }
};

export default triggerEvent;
