import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import {
  fetchClientById,
  fetchCoachByClientId,
  updateClientSubscriptionById,
  updateClientById,
  fetchSubscriptionById,
  updateSubscriptionById,
} from "@/app/utils/api";
import sgMail from "@sendgrid/mail";
import { Subscription } from "@/app/types/subscription";
import { Client, Coach } from "@/app/types/user";
import { format } from "date-fns";

export const config = {
  api: {
    bodyParser: false,
  },
};

const onClientStartScheduled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripeSubscriptionId }: { stripeSubscriptionId: string }
) => {
  await updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id: stripeSubscriptionId,
  });

  await updateClientById(client.id, {
    status: "starting",
  });
};

const onClientTermsChanged = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripeSubscriptionId }: { stripeSubscriptionId: string }
) =>
  updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id: stripeSubscriptionId,
  });

const onClientStartCanceled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) => {
  await updateClientSubscriptionById(subscription.id, {
    start_date: null,
    end_date: null,
    archived_at: new Date(),
  });

  await updateClientById(client.id, {
    status: "lead",
    subscription_status: null,
    start_date: null,
    end_date: null,
  });
};

const onClientStarted = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  {
    start_date,
    current_period_end_date,
    stripe_subscription_id,
    status,
  }: {
    start_date: Date;
    current_period_end_date: Date;
    stripe_subscription_id: string;
    status: string;
  }
) => {
  const { data: updatedSubscription } = await updateClientSubscriptionById(
    subscription?.id,
    {
      stripe_subscription_id,
      status,
      start_date,
      current_period_end_date,
    }
  );

  if (["active", "trialing"].includes(status)) {
    await updateClientById(client.id, {
      status: "client",
      access_revoked_at: null,
    });
  }

  await onPaymentAttempt(
    updatedSubscription as unknown as Subscription,
    client,
    coach
  );
};

const onPaymentAttempt = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) => {
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripe_subscription_id
  );
  const stripeInvoice = stripeSubscription
    ? await stripe.invoices.retrieve(
        stripeSubscription.latest_invoice as string
      )
    : null;

  if (stripeInvoice?.status === "paid" && stripeInvoice.amount_paid > 0) {
    await sgMail.send({
      to: client?.email,
      from: "yuriy.kurylenko@gmail.com",
      templateId: "d-fee4c2f687e54d9e97b5068673742efd",
      dynamicTemplateData: {
        client_name: client?.full_name,
        coach_name: coach?.full_name,
        invoice_number: stripeInvoice.number,
        amount: (stripeInvoice.amount_paid || stripeInvoice.amount_due) / 100,
        currency: stripeInvoice.currency.toUpperCase(),
        hosted_invoice_url: stripeInvoice.hosted_invoice_url,
      },
    });
  }
};

const onPaymentFailed = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) => {
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripe_subscription_id
  );
  const stripeInvoice = stripeSubscription
    ? await stripe.invoices.retrieve(
        stripeSubscription.latest_invoice as string
      )
    : null;

  if (stripeInvoice) {
    await sgMail.send({
      to: client?.email,
      from: "yuriy.kurylenko@gmail.com",
      templateId: "d-5e885ef0588e46b8b976eeaece239819",
      dynamicTemplateData: {
        client_name: client?.full_name,
        coach_name: coach?.full_name,
        invoice_number: stripeInvoice.number,
        amount: (stripeInvoice.amount_paid || stripeInvoice.amount_due) / 100,
        currency: stripeInvoice.currency.toUpperCase(),
        hosted_invoice_url: stripeInvoice.hosted_invoice_url,
      },
    });
  }
};

const onClientSubscriptionCancellationScheduled = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date }
) => updateSubscriptionById(subscription.id, { status, end_date });

const onClientSubscriptionRenewed = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => updateClientSubscriptionById(subscription.id, { status, end_date });

const onClientSubscriptionAutoRenewed = (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { current_period_end_date }: { current_period_end_date: Date | null }
) =>
  updateClientSubscriptionById(subscription.id, {
    current_period_end_date:
      current_period_end_date && new Date(current_period_end_date),
  });

const onClientSubscriptionCancelled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => {
  await updateClientSubscriptionById(subscription.id, {
    status,
    end_date,
  });

  await updateClientById(subscription.client_id, {
    status: "ended",
    access_revoked_at: !subscription.access_after_end_date ? new Date() : null,
  });
};

const events = [
  {
    name: "clientStartScheduled",
    handler: onClientStartScheduled,
  },
  {
    name: "clientTermsChanged",
    handler: onClientTermsChanged,
    emailTemplateId: "d-306b9c3260cd4337b3528ee2e847bb31",
  },
  {
    name: "clientStartCanceled",
    handler: onClientStartCanceled,
  },
  {
    name: "clientStarted",
    handler: onClientStarted,
  },
  {
    name: "clientPlatformAccessGranted",
    emailTemplateId: "d-bb7a32cfdef545308aea0cf7bbbee901",
  },
  {
    name: "clientPlatformAccessRestored",
    emailTemplateId: "d-f33881ff79f24f07a10820b49bdc1713",
  },
  {
    name: "clientSubscriptionCancellationScheduled",
    handler: onClientSubscriptionCancellationScheduled,
  },
  {
    name: "clientPricingChanged",
    emailTemplateId: "d-776524b90fc34aa387b8337205142e8c",
  },
  {
    name: "clientSubscriptionRenewed",
    handler: onClientSubscriptionRenewed,
    emailTemplateId: "d-664503562b62462d9931a694b35c5155",
  },
  {
    name: "clientSubscriptionAutoRenewed",
    handler: onClientSubscriptionAutoRenewed,
  },
  {
    name: "clientSubscriptionCancelled",
    handler: onClientSubscriptionCancelled,
  },
  {
    name: "paymentSucceeded",
    emailTemplateId: "d-fee4c2f687e54d9e97b5068673742efd",
  },
  {
    name: "paymentAuthenticationRequired",
    emailTemplateId: "d-f467666dc085418ba8904d165d5f5a2b",
  },
];

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(`Webhook Error: ${err.message}`);
      } else {
        res.status(400).send(`Webhook Error: ${err}`);
      }
      return;
    }

    const eventObject = event.data.object;

    let clientSubscription;

    // @ts-ignore
    switch (eventObject.object) {
      case "subscription_schedule":
      case "subscription":
        clientSubscription = // @ts-ignore
          (await fetchSubscriptionById(eventObject.metadata.subscription_id))
            ?.data;
        break;
      case "invoice":
        const stripeSubscription = await stripe.subscriptions.retrieve(
          // @ts-ignore
          eventObject.subscription
        );
        clientSubscription = (
          await fetchSubscriptionById(
            stripeSubscription.metadata.subscription_id
          )
        )?.data;
        break;
      default:
        clientSubscription = null;
        break;
    }

    const { data: client } = await fetchClientById(
      clientSubscription?.client_id
    );
    const { data: coach } = await fetchCoachByClientId(
      clientSubscription?.client_id
    );

    if (clientSubscription && client && coach) {
      switch (event.type) {
        case "subscription_schedule.created":
          const subscriptionSchedule = event.data
            .object as Stripe.SubscriptionSchedule;

          if (subscriptionSchedule.metadata?.updated) {
            await triggerEvent(
              "clientTermsChanged",
              {
                subscription: clientSubscription as Subscription,
                client: client as Client,
                coach: coach as Coach,
              },
              { stripeSubscriptionId: subscriptionSchedule.id }
            );
          } else {
            await triggerEvent(
              "clientStartScheduled",
              {
                subscription: clientSubscription as Subscription,
                client: client as Client,
                coach: coach as Coach,
              },
              { stripeSubscriptionId: subscriptionSchedule.id }
            );
          }
          break;

        case "subscription_schedule.canceled":
          if (
            !clientSubscription.archived_at &&
            clientSubscription.start_date &&
            new Date(clientSubscription.start_date) >= new Date()
          ) {
            await triggerEvent("clientStartCanceled", {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            });
          }
          break;

        case "customer.subscription.created":
          const subscription = event.data.object as Stripe.Subscription;

          await triggerEvent(
            "clientStarted",
            {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            },
            {
              start_date: new Date(subscription.start_date * 1000),
              current_period_end_date: new Date(
                subscription.current_period_end * 1000
              ),
              stripe_subscription_id: subscription.id,
              status: subscription.status,
            }
          );

          if (client.user_id) {
            await triggerEvent("clientPlatformAccessRestored", {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            });
          } else {
            await triggerEvent("clientPlatformAccessGranted", {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            });
          }
          break;

        case "customer.subscription.updated":
          const updatedSubscription = event.data.object as Stripe.Subscription;

          const subscriptionCancellationScheduled =
            updatedSubscription.current_period_end &&
            updatedSubscription.cancel_at_period_end;

          const pricingChanged =
            ((event.data.previous_attributes as any)?.plan?.amount ||
              (event.data.previous_attributes as any)?.plan?.currency) &&
            !(event.data.previous_attributes as any).cancel_at_period_end;

          const subscriptionRenewed = (event.data.previous_attributes as any)
            .cancel_at_period_end;

          if (subscriptionCancellationScheduled) {
            await triggerEvent(
              "clientSubscriptionCancellationScheduled",
              {
                subscription: clientSubscription as Subscription,
                client: client as Client,
                coach: coach as Coach,
              },
              {
                status: updatedSubscription.status,
                end_date: new Date(
                  updatedSubscription.current_period_end * 1000
                ),
              }
            );
          } else if (pricingChanged) {
            await triggerEvent("clientPricingChanged", {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            });
          } else if (subscriptionRenewed) {
            await triggerEvent(
              "clientSubscriptionRenewed",
              {
                subscription: clientSubscription as Subscription,
                client: client as Client,
                coach: coach as Coach,
              },
              {
                status: updatedSubscription.status,
                end_date: null,
              }
            );
          }
          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object as Stripe.Subscription;

          await triggerEvent(
            "clientSubscriptionCancelled",
            {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            },
            {
              status: deletedSubscription.status,
              end_date: deletedSubscription.canceled_at
                ? new Date(deletedSubscription.canceled_at * 1000)
                : null,
            }
          );
          break;

        case "invoice.created":
          const invoice = event.data.object as Stripe.Invoice;
          const invoiceSubscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          await triggerEvent(
            "clientSubscriptionAutoRenewed",
            {
              subscription: clientSubscription as Subscription,
              client: client as Client,
              coach: coach as Coach,
            },
            {
              current_period_end_date: new Date(
                invoiceSubscription.current_period_end * 1000
              ),
            }
          );
          break;

        case "invoice.payment_succeeded":
          const stripeInvoice = event.data.object as Stripe.Invoice;
          if (stripeInvoice.billing_reason !== "subscription_create") {
            await triggerEvent(
              "paymentSucceeded",
              {
                subscription: clientSubscription as Subscription,
                client: client as Client,
                coach: coach as Coach,
              },
              {
                invoice_number: stripeInvoice.number,
                amount:
                  (stripeInvoice.amount_paid || stripeInvoice.amount_due) / 100,
                currency: stripeInvoice.currency.toUpperCase(),
                hosted_invoice_url: stripeInvoice.hosted_invoice_url,
              }
            );
          }
          break;

        case "invoice.payment_failed":
          const failedStripeInvoice = event.data.object as Stripe.Invoice;

          if (failedStripeInvoice.billing_reason !== "subscription_create") {
            const stripeCharge = failedStripeInvoice.charge
              ? await stripe.charges.retrieve(
                  failedStripeInvoice.charge as string
                )
              : null;
            if (
              stripeCharge &&
              stripeCharge.failure_code === "authentication_required"
            ) {
              await triggerEvent(
                "paymentAuthenticationRequired",
                {
                  subscription: clientSubscription as Subscription,
                  client: client as Client,
                  coach: coach as Coach,
                },
                {
                  invoice_number: failedStripeInvoice.number,
                  amount:
                    (failedStripeInvoice.amount_paid ||
                      failedStripeInvoice.amount_due) / 100,
                  currency: failedStripeInvoice.currency.toUpperCase(),
                  hosted_invoice_url: failedStripeInvoice.hosted_invoice_url,
                }
              );
            } else {
              await onPaymentFailed(
                clientSubscription as Subscription,
                client as Client,
                coach as Coach
              );
            }
          }
          break;

        default:
          res.json({ received: true });
          return;
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
