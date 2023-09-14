import { Subscription, SubscriptionInput } from "@/types/subscription";
import { ClientInput, CoachInput } from "@/types/user";
import supabase from "@/initializers/supabaseClient";
import { UUID } from "crypto";
import {
  cancelStripeSubscription,
  cancelStripeSubscriptionSchedule,
  findOrCreateStripePrice,
  updateStripeSubscription,
} from "@/app/utils/api/stripe";
import StripeApi from "stripe";
import { format } from "date-fns";
import { MailService } from "@sendgrid/mail";

const startOfUtcDay = (date: Date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
};

export const fetchCoachById = (id: UUID) =>
  supabase.from("coaches").select("*").eq("id", id).single();

export const fetchCoachBySlug = (slug: string) =>
  supabase.from("coaches").select("*").eq("slug", slug).single();

export const fetchClientById = (clientId: UUID) =>
  supabase.from("clients").select("*").eq("id", clientId).single();

export const fetchCoachByClientId = async (clientId: UUID) => {
  const { data, error } = await fetchClientById(clientId);
  if (error) {
    return { data, error };
  }
  return fetchCoachById(data.coach_id);
};

export const fetchClientsByCoachId = async (
  coachId: UUID,
  page: number = 1,
  filterStatus: string = "all",
  filterText: string = "",
  sortColumn: string = "updated_at",
  sortDirection: "asc" | "desc" = "desc"
) => {
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  let query = supabase
    .from("clients")
    .select(
      "*, subscriptions (status, updated_at, monthly_amount, currency, trial_period_days, archived_at)"
    )
    .eq("coach_id", coachId)
    .is("archived_at", null);

  let totalQuery = supabase
    .from("clients")
    .select("id", { count: "exact" })
    .eq("coach_id", coachId)
    .is("archived_at", null);

  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
    totalQuery = totalQuery.eq("status", filterStatus);
  }

  if (filterText) {
    query = query.ilike("full_name", `%${filterText}%`);
    totalQuery = totalQuery.ilike("full_name", `%${filterText}%`);
  }

  if (sortColumn) {
    query = query.order(sortColumn, { ascending: sortDirection === "asc" });
  }

  const response = await query.range(offset, offset + itemsPerPage - 1);
  const total = await totalQuery;

  if (response.data) {
    response.data = response.data.map((client) => ({
      ...client,
      subscription: client.subscriptions
        .filter((s: Subscription) => s.archived_at == null)
        .sort(
          (s1: Subscription, s2: Subscription) =>
            new Date(s2.updated_at as Date).getTime() -
            new Date(s1.updated_at as Date).getTime()
        )[0],
    }));
  }

  return { ...response, total: total.count };
};

export const fetchSubscriptionById = (subscriptionId: UUID | string) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .is("archived_at", null)
    .single();

export const fetchSubscriptionByClientId = (clientId: UUID | string) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", clientId)
    .is("archived_at", null)
    .single();

export const fetchSubscriptionByStripeSubscriptionId = (
  stripeSubscriptionId: string
) =>
  supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .is("archived_at", null)
    .single();

export const createClient = ({ full_name, email, coach_id }: ClientInput) =>
  supabase
    .from("clients")
    .insert([
      {
        full_name,
        email,
        coach_id,
      },
    ])
    .select();

export const createCoach = ({
  user_id,
  full_name,
  email,
  monthly_subscription_amount,
  subscription_currency,
}: CoachInput) =>
  supabase
    .from("coaches")
    .insert({
      user_id,
      full_name,
      email,
      monthly_subscription_amount,
      subscription_currency,
    })
    .select();

export const createClientSubscription = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency,
    trialPeriodDays,
    startDate,
    stripeSubscriptionId,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays: number;
    startDate?: Date | string | null;
    stripeSubscriptionId?: string | null;
  },
  stripe: StripeApi
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const utcStartDate =
    startDate && startOfUtcDay(new Date(startDate)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(startDate))
      : null;
  let price;

  await updateSubscriptionByClientId(clientId, { archived_at: new Date() });

  price = await findOrCreateStripePrice(stripe, {
    product: coach.stripe_product_id,
    interval: "month",
    unit_amount: monthlyAmount * 100,
    currency,
  });

  return await supabase
    .from("subscriptions")
    .insert([
      {
        client_id: clientId,
        monthly_amount: monthlyAmount * 100,
        currency,
        stripe_price_id: price.id,
        trial_period_days: trialPeriodDays,
        start_date: utcStartDate,
        stripe_subscription_id: stripeSubscriptionId,
      },
    ])
    .select()
    .single();
};

export const updateClientSubscriptionById = (
  subscriptionId: UUID | string,
  data: SubscriptionInput
) =>
  supabase
    .from("subscriptions")
    .update(data)
    .eq("id", subscriptionId)
    .select()
    .single();

export const updateClientSubscriptionByStripeSubscriptionId = (
  stripeSubscriptionId: string,
  data: SubscriptionInput
) =>
  supabase
    .from("subscriptions")
    .update(data)
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .select()
    .single();

export const updateClientById = (clientId: UUID | string, data: ClientInput) =>
  supabase.from("clients").update(data).eq("id", clientId).select().single();

export const updateCoachById = (coachId: UUID | string, data: CoachInput) =>
  supabase.from("coaches").update(data).eq("id", coachId).select().single();

export const updateSubscriptionByClientId = async (
  clientId: UUID | string,
  data: SubscriptionInput
) =>
  supabase
    .from("subscriptions")
    .update(data)
    .eq("client_id", clientId)
    .select();

export const updateSubscriptionById = async (
  subscriptionId: UUID | string,
  data: SubscriptionInput
) =>
  supabase.from("subscriptions").update(data).eq("id", subscriptionId).select();

export const sendClientPaymentLink = async (
  subscription: Subscription,
  sgMail: MailService
) => {
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
        payment_link: `https://coaching-ten.vercel.app/subscription/${subscription.id}`,
        trial_period_days: subscription.trial_period_days,
        start_date: format(
          !subscription.start_date ||
            new Date(subscription.start_date) < new Date()
            ? new Date()
            : new Date(subscription.start_date),
          "dd/MM/yyyy"
        ),
      },
    });
  }
};

export const sendClientOffer = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
    trialPeriodDays,
    trialPeriod,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays?: number;
    trialPeriod?: boolean;
    startDate?: Date | string | null;
  },
  stripe: StripeApi,
  sgMail: MailService
) => {
  const { data: subscription, error: subscriptionError } =
    await createClientSubscription(
      clientId as UUID,
      {
        monthlyAmount,
        currency,
        trialPeriodDays: trialPeriodDays || (trialPeriod ? 14 : 0),
        startDate,
      },
      stripe
    );

  if (subscriptionError) {
    return { subscription, error: { message: "Error creating subscription" } };
  }

  if (subscription) {
    await sendClientPaymentLink(subscription as Subscription, sgMail);
  }

  const { data, error } = await updateClientById(clientId as UUID, {
    status: "offerSent",
  });
  return { data, error };
};

export const changeClientTerms = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
    trialPeriodDays,
    trialPeriod,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays?: number;
    trialPeriod?: boolean;
    startDate: Date;
  },
  stripe: StripeApi
) => {
  const utcStartDate =
    startDate && startOfUtcDay(new Date(startDate)) > startOfUtcDay(new Date())
      ? startOfUtcDay(new Date(startDate))
      : startOfUtcDay(new Date());

  trialPeriodDays = trialPeriodDays || (trialPeriod ? 14 : 0);

  let trialEndDate = new Date(utcStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);

  const { data: subscription } = await fetchSubscriptionByClientId(clientId);
  const { data: coach } = await fetchCoachByClientId(subscription?.client_id);

  const { data: clietSubscription, error } = await createClientSubscription(
    clientId,
    {
      monthlyAmount: monthlyAmount,
      currency,
      trialPeriodDays: trialPeriodDays ? trialPeriodDays : trialPeriod ? 14 : 0,
      startDate: utcStartDate,
    },
    stripe
  );

  if (error) {
    return { data: clietSubscription, error };
  }

  const { customer } = await stripe.subscriptionSchedules.cancel(
    subscription?.stripe_subscription_id
  );

  const price = await findOrCreateStripePrice(stripe, {
    product: coach?.stripe_product_id,
    unit_amount: monthlyAmount,
    interval: "month",
    currency,
  });

  const metadata = {
    subscription_id: clietSubscription?.id,
    updated: true,
  };

  await stripe.subscriptionSchedules.create({
    // @ts-ignore
    customer,
    start_date: Math.floor(new Date(utcStartDate).getTime() / 1000),
    end_behavior: "release",
    phases: [
      {
        trial_end:
          trialPeriodDays > 0
            ? Math.floor(trialEndDate.getTime() / 1000)
            : undefined,
        items: [
          {
            price: price.id,
            quantity: 1,
            metadata,
          },
        ],
        metadata,
      },
    ],
    metadata,
  });

  return { data: clietSubscription, error };
};

export const changeClientPrice = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
  }: {
    monthlyAmount: number;
    currency: string;
  },
  stripe: StripeApi
) => {
  const { data: coach } = await fetchCoachByClientId(clientId);
  const { data: client } = await fetchClientById(clientId);

  if (!coach) {
    return { data: null, error: { message: "Coach not found" } };
  }

  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);

  if (!subscriptions?.length) {
    return { data: null, error: { message: "Client subscription not found" } };
  }

  const subscription = subscriptions?.[0];

  try {
    await updateStripeSubscription(
      {
        stripeSubscriptionId: subscription.stripe_subscription_id,
        monthlyAmount: monthlyAmount * 100,
        currency,
        isActiveSubscription: true,
      },
      stripe
    );

    await updateClientSubscriptionById(subscription.id, {
      monthly_amount: monthlyAmount * 100,
      currency,
    });

    return { data: client, error: null };
  } catch (e) {
    return { data: null, error: { message: "Error updating client terms" } };
  }
};

export const archiveClient = async (clientId: UUID) => {
  const { data, error } = await updateClientById(clientId, {
    archived_at: new Date(),
  });
  return { data, error };
};

export const activateClient = async (subscriptionId: UUID) => {
  const { data: subscription, error } = await fetchSubscriptionById(
    subscriptionId
  );

  if (error) {
    return { data: subscription, error };
  }
  await updateClientById(subscription.client_id, {
    status:
      new Date(subscription.start_date) <= new Date() ? "client" : "starting",
  });
};

async function fetchSubscriptionsByClientId(clientId: UUID | string) {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .is("archived_at", null)
      .eq("client_id", clientId);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export const cancelClientSubscription = async (
  clientId: UUID,
  data: {
    endImmediately: boolean;
    accessAfterEndDate: boolean;
  },
  stripe: StripeApi
) => {
  const { endImmediately, accessAfterEndDate } = data;
  const { data: subscriptions } = await fetchSubscriptionsByClientId(
    clientId as string
  );

  for (const subscription of (subscriptions || []).filter((s) =>
    ["active", "trialing", "past_due", "unpaid"].includes(s.status)
  )) {
    try {
      await cancelStripeSubscription(
        subscription.stripe_subscription_id,
        endImmediately,
        accessAfterEndDate,
        stripe
      );
    } catch (error) {
      return {
        data: null,
        error: { message: "Error cancelling client's subscription" },
      };
    }
  }

  return { data: subscriptions, error: null };
};

export const cancelClientStart = async (clientId: UUID, stripe: StripeApi) => {
  const { data: subscriptions } = await fetchSubscriptionsByClientId(clientId);

  for (const subscription of subscriptions || []) {
    try {
      await cancelStripeSubscriptionSchedule(
        subscription.stripe_subscription_id,
        stripe
      );
    } catch (error) {
      return {
        data: null,
        error: { message: "Error cancelling client's start" },
      };
    }
  }

  return { data: subscriptions, error: null };
};

export const cancelClientOffer = async (clientId: UUID) => {
  const { error } = await updateSubscriptionByClientId(clientId, {
    archived_at: new Date(),
    start_date: null,
    end_date: null,
  });

  if (error) {
    return { data: null, error };
  }

  return await updateClientById(clientId, {
    status: "lead",
    subscription_status: null,
    start_date: null,
    end_date: null,
  });
};
