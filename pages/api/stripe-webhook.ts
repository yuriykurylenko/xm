import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "@/app/utils/initStripe";
import { buffer } from "micro";
import {
  fetchSubscriptionByStripeSubscriptionId,
  fetchClientById,
  fetchCoachByClientId,
  updateClientSubscriptionByStripeSubscriptionId,
  updateClientSubscriptionById,
  updateClientById,
  fetchSubscriptionById,
  updateSubscriptionById,
} from "@/app/utils/api";
import sgMail from "@sendgrid/mail";
import { Subscription, SubscriptionInput } from "@/app/types/subscription";
import { Client, ClientInput, Coach } from "@/app/types/user";
import { format } from "date-fns";
import { UUID } from "crypto";

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
  const { data: clientSubscription } = await updateClientSubscriptionById(
    subscription.id,
    { stripe_subscription_id: stripeSubscriptionId }
  );

  if (clientSubscription) {
    await updateClientById(client.id, {
      status: "starting",
    });
  }
};

const onClientTermsChanged = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { stripeSubscriptionId }: { stripeSubscriptionId: string }
) => {
  await updateClientSubscriptionById(subscription.id, {
    stripe_subscription_id: stripeSubscriptionId,
  });

  await sgMail.send({
    to: client.email,
    from: "yuriy.kurylenko@gmail.com",
    templateId: "d-306b9c3260cd4337b3528ee2e847bb31",
    dynamicTemplateData: {
      client_name: client.full_name,
      coach_name: coach.full_name,
      subscription_id: subscription?.id,
      amount: subscription?.monthly_amount / 100,
      currency: subscription?.currency,
      trial_period_days: subscription?.trial_period_days,
      start_date: format(
        !subscription?.start_date ||
          new Date(subscription.start_date) < new Date()
          ? new Date()
          : new Date(subscription.start_date),
        "dd/MM/yyyy"
      ),
    },
  });
};

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

  if (["active", "trialing"].includes(subscription.status)) {
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

const onClientPlatformAccessGranted = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) =>
  sgMail.send({
    to: client.email,
    from: "yuriy.kurylenko@gmail.com",
    templateId: "d-bb7a32cfdef545308aea0cf7bbbee901",
    dynamicTemplateData: {
      client_name: client.full_name,
      coach_name: coach.full_name,
      subscription_id: subscription.id,
    },
  });

const onClientPlatformAccessRestored = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) =>
  sgMail.send({
    to: client.email,
    from: "yuriy.kurylenko@gmail.com",
    templateId: "d-f33881ff79f24f07a10820b49bdc1713",
    dynamicTemplateData: {
      client_name: client.full_name,
      coach_name: coach.full_name,
    },
  });

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

const onPaymentSucceeded = async (
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

const onPaymentAuthenticationRequired = async (
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
      templateId: "d-f467666dc085418ba8904d165d5f5a2b",
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

const onClientPricingChanged = async (
  subscription: Subscription,
  client: Client,
  coach: Coach
) => {
  await sgMail.send({
    to: client.email,
    from: "yuriy.kurylenko@gmail.com",
    templateId: "d-776524b90fc34aa387b8337205142e8c",
    dynamicTemplateData: {
      client_name: client.full_name,
      coach_name: coach.full_name,
      amount: subscription.monthly_amount / 100,
      currency: subscription.currency,
      new_price_start_date:
        subscription.current_period_end_date &&
        format(new Date(subscription.current_period_end_date), "dd/MM/yyyy"),
    },
  });
};

const onClientSubscriptionRenewed = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => {
  await updateClientSubscriptionById(subscription.id, { status, end_date });

  await sgMail.send({
    to: client.email,
    from: "yuriy.kurylenko@gmail.com",
    templateId: "d-664503562b62462d9931a694b35c5155",
    dynamicTemplateData: {
      client_name: client.full_name,
      coach_name: coach.full_name,
      amount: subscription.monthly_amount / 100,
      currency: subscription.currency,
      new_price_start_date:
        subscription.current_period_end_date &&
        format(new Date(subscription.current_period_end_date), "dd/MM/yyyy"),
    },
  });
};

const onClientSubscriptionAutoRenewed = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { current_period_end_date }: { current_period_end_date: Date | null }
) => {
  await updateClientSubscriptionById(subscription.id, {
    current_period_end_date:
      current_period_end_date && new Date(current_period_end_date),
  });
};

const onClientSubscriptionCancelled = async (
  subscription: Subscription,
  client: Client,
  coach: Coach,
  { status, end_date }: { status: string; end_date: Date | null }
) => {
  await updateClientSubscriptionByStripeSubscriptionId(subscription.id, {
    status,
    end_date,
  });

  await updateClientById(subscription.client_id, {
    status: "ended",
    access_revoked_at: !subscription.access_after_end_date ? new Date() : null,
  });
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

    if (event.type === "subscription_schedule.created") {
      const subscriptionSchedule = event.data
        .object as Stripe.SubscriptionSchedule;

      if (subscriptionSchedule.metadata?.subscription_id) {
        const { data: clientSubscription } = await fetchSubscriptionById(
          subscriptionSchedule.metadata.subscription_id as UUID
        );
        const { data: client } = await fetchClientById(
          clientSubscription?.client_id
        );
        const { data: coach } = await fetchCoachByClientId(
          clientSubscription?.client_id
        );

        if (subscriptionSchedule.metadata.updated) {
          await onClientTermsChanged(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach,
            {
              stripeSubscriptionId: subscriptionSchedule.id,
            }
          );
        } else {
          await onClientStartScheduled(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach,
            { stripeSubscriptionId: subscriptionSchedule.id }
          );
        }
      }

      res.json({ received: true });
    } else if (event.type === "subscription_schedule.canceled") {
      const subscriptionSchedule = event.data
        .object as Stripe.SubscriptionSchedule;

      if (subscriptionSchedule.metadata?.subscription_id) {
        const { data: clientSubscription } = await fetchSubscriptionById(
          subscriptionSchedule.metadata.subscription_id as UUID
        );
        const { data: client } = await fetchClientById(
          clientSubscription?.client_id
        );
        const { data: coach } = await fetchCoachByClientId(
          clientSubscription?.client_id
        );

        if (
          clientSubscription &&
          !clientSubscription.archived_at &&
          clientSubscription.start_date &&
          new Date(clientSubscription.start_date) >= new Date()
        ) {
          await onClientStartCanceled(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach
          );
        }
      }

      res.json({ received: true });
    } else if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;

      if (subscription.metadata.subscription_id) {
        const { data: clientSubscription } = await fetchSubscriptionById(
          subscription.metadata.subscription_id as UUID
        );
        const { data: client } = await fetchClientById(
          clientSubscription?.client_id
        );
        const { data: coach } = await fetchCoachByClientId(
          clientSubscription?.client_id
        );

        if (clientSubscription) {
          await onClientStarted(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach,
            {
              start_date: new Date(subscription.start_date * 1000),
              current_period_end_date: new Date(
                subscription.current_period_end * 1000
              ),
              stripe_subscription_id: subscription.id,
              status: subscription.status,
            }
          );

          if (coach && client && !client.user_id) {
            await onClientPlatformAccessGranted(
              clientSubscription as Subscription,
              client as Client,
              coach as Coach
            );
          } else if (coach && client && client.user_id) {
            await onClientPlatformAccessRestored(
              clientSubscription as Subscription,
              client as Client,
              coach as Coach
            );
          }
        }
      }

      res.json({ received: true });
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const { data: clientSubscription } =
        await fetchSubscriptionByStripeSubscriptionId(subscription.id);

      if (clientSubscription) {
        const { data: client } = await fetchClientById(
          clientSubscription.client_id
        );
        const { data: coach } = await fetchCoachByClientId(
          clientSubscription.client_id
        );

        const subscriptionCancellationScheduled =
          subscription.current_period_end && subscription.cancel_at_period_end;

        const pricingChanged =
          ((event.data.previous_attributes as any)?.plan?.amount ||
            (event.data.previous_attributes as any)?.plan?.currency) &&
          !(event.data.previous_attributes as any).cancel_at_period_end;

        const subscriptionRenewed = (event.data.previous_attributes as any)
          .cancel_at_period_end;

        if (subscriptionCancellationScheduled) {
          await onClientSubscriptionCancellationScheduled(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach,
            {
              status: subscription.status,
              end_date: new Date(subscription.current_period_end * 1000),
            }
          );
        } else if (pricingChanged) {
          await onClientPricingChanged(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach
          );
        } else if (subscriptionRenewed) {
          await onClientSubscriptionRenewed(
            clientSubscription as Subscription,
            client as Client,
            coach as Coach,
            {
              status: subscription.status,
              end_date: null,
            }
          );
        }
      }

      res.json({ received: true });
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const { data: clientSubscription } =
        await fetchSubscriptionByStripeSubscriptionId(subscription.id);

      if (clientSubscription) {
        const { data: client } = await fetchClientById(
          clientSubscription.client_id
        );
        const { data: coach } = await fetchCoachByClientId(
          clientSubscription.client_id
        );

        await onClientSubscriptionCancelled(
          clientSubscription as Subscription,
          client as Client,
          coach as Coach,
          {
            status: subscription.status,
            end_date: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
          }
        );
      }

      res.json({ received: true });
    } else if (event.type === "invoice.created") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      const { data: clientSubscription } =
        await fetchSubscriptionByStripeSubscriptionId(subscription.id);

      if (clientSubscription) {
        const { data: client } = await fetchClientById(
          clientSubscription.client_id
        );
        const { data: coach } = await fetchCoachByClientId(
          clientSubscription.client_id
        );

        await onClientSubscriptionAutoRenewed(
          clientSubscription as Subscription,
          client as Client,
          coach as Coach,
          {
            current_period_end_date: new Date(
              subscription.current_period_end * 1000
            ),
          }
        );
      }
    } else if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const stripeInvoice = event.data.object as Stripe.Invoice;

      if (!stripeInvoice.charge) {
        return res.json({ received: true });
      }

      const stripeCharge = await stripe.charges.retrieve(
        stripeInvoice.charge as string
      );

      const { data: subscription } =
        await fetchSubscriptionByStripeSubscriptionId(
          stripeInvoice.subscription as string
        );

      if (subscription) {
        const { data: client } = await fetchClientById(subscription?.client_id);
        const { data: coach } = await fetchCoachByClientId(
          subscription?.client_id
        );

        if (stripeInvoice.billing_reason !== "subscription_create") {
          if (event.type === "invoice.payment_succeeded") {
            await onPaymentSucceeded(
              subscription as Subscription,
              client as Client,
              coach as Coach
            );
          } else if (
            event.type === "invoice.payment_failed" &&
            stripeCharge.failure_code === "authentication_required"
          ) {
            await onPaymentAuthenticationRequired(
              subscription as Subscription,
              client as Client,
              coach as Coach
            );
          } else if (event.type === "invoice.payment_failed") {
            await onPaymentFailed(
              subscription as Subscription,
              client as Client,
              coach as Coach
            );
          }
        }
      }

      res.json({ received: true });
    } else {
      res.json({ received: true });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
