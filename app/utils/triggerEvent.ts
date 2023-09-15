import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

import sgMail from "@/initializers/sgMail";

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
  const { default: eventDefinition } = await import(
    `@/domains/clients/events/${name}`
  );

  if (!eventDefinition) {
    throw new Error(`Event ${name} not found.`);
  }

  if (eventDefinition) {
    if (eventDefinition.handler) {
      await eventDefinition.handler(subscription, client, coach, data);
    }

    if (eventDefinition.emailTemplateId) {
      await sgMail.send({
        to: client.email,
        from: "yuriy.kurylenko@gmail.com",
        templateId: eventDefinition.emailTemplateId,
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
