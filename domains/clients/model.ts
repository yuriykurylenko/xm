import { fetch as fetchSubscriptionById } from "@/domains/clients/domains/subscriptions/model";
import db from "@/initializers/supabaseClient";
import { Subscription } from "@/types/subscription";
import { ClientInput } from "@/types/user";
import { UUID } from "crypto";

export const fetch = (id: UUID) =>
  db.from("clients").select("*").eq("id", id).single();

export const fetchAllByCoachId = async (
  coachId: UUID,
  page: number = 1,
  filterStatus: string = "all",
  filterText: string = "",
  sortColumn: string = "updated_at",
  sortDirection: "asc" | "desc" = "desc"
) => {
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  let query = db
    .from("clients")
    .select(
      "*, subscriptions (status, updated_at, monthly_amount, currency, trial_period_days, archived_at)"
    )
    .eq("coach_id", coachId)
    .is("archived_at", null);

  let totalQuery = db
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

export const create = ({ full_name, email, coach_id }: ClientInput) =>
  db
    .from("clients")
    .insert([
      {
        full_name,
        email,
        coach_id,
      },
    ])
    .select();

export const update = (clientId: UUID | string, data: ClientInput) =>
  db.from("clients").update(data).eq("id", clientId).select().single();

export const activate = async (subscriptionId: UUID) => {
  const { data: subscription, error } = await fetchSubscriptionById(
    subscriptionId
  );

  if (error) {
    return { data: subscription, error };
  }
  await update(subscription.client_id, {
    status:
      new Date(subscription.start_date) <= new Date() ? "client" : "starting",
  });
};
