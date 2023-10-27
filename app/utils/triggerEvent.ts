import { Subscription } from "@/types/subscription";
import { Client, Coach } from "@/types/user";
import config from "@/app/utils/config";

import sgMail from "@/initializers/sgMail";

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
  const { events } = config;

  const eventParts = name.split(".");
  const eventName = eventParts.pop();
  const domainPath = eventParts.join("/domains/");

  const { handler, triggerConditions } = await import(
    `@/domains/${domainPath}/events/${eventName}`
  );

  if (!handler && !triggerConditions && !events[name]) {
    throw new Error(`Event ${name} not found.`);
  }

  if (triggerConditions && !triggerConditions(context)) {
    return;
  }

  if (handler) {
    await handler(subscription, client, coach, data);
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
