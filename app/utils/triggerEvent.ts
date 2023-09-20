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
  data?: any,
  context?: any
) => {
  const [domain, eventName] = name.split(".");

  const { default: eventDefinition } = await import(
    `@/domains/${domain}/events/${eventName}`
  );

  if (!eventDefinition) {
    throw new Error(`Event ${name} not found.`);
  }

  if (eventDefinition) {
    if (
      eventDefinition.triggerConditions &&
      !eventDefinition.triggerConditions(context)
    ) {
      return;
    }

    if (eventDefinition.handler) {
      await eventDefinition.handler(subscription, client, coach, data);
    }

    if (eventDefinition.emailTemplateId) {
      await sgMail.send({
        to: data?.notification_email,
        from: "yuriy.kurylenko@gmail.com",
        templateId: eventDefinition.emailTemplateId,
        dynamicTemplateData: {
          client_name: data?.client_name,
          coach_name: data?.coach_name,
          subscription_id: data?.subscription_id,
          amount: data?.amount,
          currency: data?.currency,
          trial_period_days: data?.trial_period_days,
          start_date:
            data?.start_date && format(data?.start_date, "dd/MM/yyyy"),
          new_price_start_date:
            data?.new_price_start_date &&
            format(data?.new_price_start_date, "dd/MM/yyyy"),
          invoice_number: data?.invoice_number,
          hosted_invoice_url: data?.hosted_invoice_url,
        },
      });
    }
  }
};

export default triggerEvent;
