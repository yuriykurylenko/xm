import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";

import sgMail from "@/initializers/sgMail";
import axios from "axios";

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

  const {
    data: { events },
  } = await axios.get("/api/config/actions");

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
  }

  if (events[name]?.emailTemplateId) {
    await sgMail.send({
      to: data?.notification_email,
      from: "yuriy.kurylenko@gmail.com",
      templateId: events[name].emailTemplateId,
      dynamicTemplateData: data,
    });
  }
};

export default triggerEvent;
