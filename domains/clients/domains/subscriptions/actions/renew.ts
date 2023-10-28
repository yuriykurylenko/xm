import { Client } from "@/types/user";
import { changePriceOrRenewSubscription } from "@/domains/clients/actions/common/handlers";
import { onComplete } from "@/domains/clients/actions/common/handlers";
import { Subscription } from "@/types/subscription";

export const show = (subscription: Subscription) =>
  ["trialing", "active", "past_due", "unpaid"].includes(subscription.status) &&
  subscription.end_date != null;

export const handler = changePriceOrRenewSubscription;
export { onComplete };
