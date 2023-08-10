import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  cancelClientSubscription,
  fetchClientsByCoachId,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";

import ItemList, { Action } from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import {
  faDollarSign,
  faPaperPlane,
  faPowerOff,
  faRotate,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";
import { ClientTermsFormFields } from "@/app/components/clients/DialogForms/ClientTermsFields";
import { PriceField } from "@/app/components/clients/DialogForms/PriceField";
import { EndClientFields } from "@/app/components/clients/DialogForms/EndClientFields";

const Clients = ({ user }: { user: Coach }) => {
  const fetchClients = async (
    page: number,
    filterStatus: string,
    filterText?: string,
    sortColumn?: string,
    sortDirection?: "asc" | "desc"
  ) => {
    const { data, total } = await fetchClientsByCoachId(
      user.id as UUID,
      page,
      filterStatus,
      filterText,
      sortColumn,
      sortDirection
    );

    return { data, total } as { data: Client[]; total: number };
  };

  const onSendOfferComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("offerSent");

  const onCancelClientOfferComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("lead");

  const onCancelClientSubscriptionComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("ended");

  const onCancelClientSubscriptionScheduleComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("lead");

  const actions: Action<Client>[] = [
    {
      name: "sendOffer",
      title: "Send offer",
      titleBulk: "Send offers",
      icon: faPaperPlane,
      show: (client: Client) => client.status === "lead",
      apiOperation: "send_offer",
      onComplete: onSendOfferComplete,
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: "Send offer to {{full_name}}",
      dialogTitleBulk: "Send offers to {{n}} clients",
      dialogText:
        "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly.",
      dialogTextBulk:
        "Your clients  will receive an email with the link to subscribe and pay your specified amount monthly.",
    },
    {
      name: "changeStartingSubscription",
      title: "Change client's terms",
      titleBulk: "Change clients' terms",
      icon: faRotate,
      show: (client: Client) => client.status === "starting",
      apiOperation: "change_terms",
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: "Change terms for {{full_name}}",
      dialogTitleBulk: "Change terms {{n}} clients",
      dialogText:
        "Please specify the new price and start date for {{full_name}}. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
      dialogTextBulk:
        "Please specify the new price and start date for selected clients. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "changeSubscriptionAmount",
      title: "Change client's monthly price",
      titleBulk: "Change clients' monthly price",
      icon: faDollarSign,
      show: (client: Client) =>
        client.status === "client" && client.end_date === null,
      apiOperation: "change_price",
      DialogForm: ({ items }: { items: Client[] }) =>
        PriceField({ items, coach: user }),
      dialogTitle: "Change price for {{full_name}}",
      dialogTitleBulk: "Change price for {{n}} clients",
      dialogText:
        "Please specify the new price for {{full_name}}. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
      dialogTextBulk:
        "Please specify the new price for selected clients. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "renewSubscription",
      title: "Renew client's subscription",
      titleBulk: "Renew clients' subscriptions",
      icon: faRotate,
      show: (client: Client) =>
        client.status === "client" && client.end_date != null,
      apiOperation: "change_price",
      DialogForm: ({ items }: { items: Client[] }) =>
        PriceField({ items, coach: user }),
      dialogTitle: "Renew {{full_name}}'s subscription",
      dialogTitleBulk: "Renew {{n}} clients' subscriptions",
      dialogText:
        "Your client's subscription will be renewed. You can specify the new price for {{full_name}}. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
      dialogTextBulk:
        "Your clients' subscriptions will be renewed. You can specify the new price for them. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "resendOffer",
      title: "Send a new offer",
      titleBulk: "Send new offers",
      icon: faRotate,
      show: (client: Client) => client.status === "offerSent",
      apiOperation: "send_offer",
      onComplete: onSendOfferComplete,
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: "Send a new offer to {{full_name}}",
      dialogTitleBulk: "Send new offers to {{n}} clients",
      dialogText:
        "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly. Your previous offer to them will be canceled.",
      dialogTextBulk:
        "Your clients will receive an email with the link to subscribe and pay your specified amount monthly. Your previous offers to them will be canceled",
    },
    {
      name: "sendOfferToEndedClient",
      title: "Send a new offer",
      titleBulk: "Send new offers",
      icon: faRotate,
      show: (client: Client) => client.status === "ended",
      apiOperation: "send_offer",
      onComplete: onSendOfferComplete,
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: "Send a new offer to {{full_name}}",
      dialogTitleBulk: "Send new offers to {{n}} clients",
      dialogText:
        "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly.",
      dialogTextBulk:
        "Your clients will receive an email with the link to subscribe and pay your specified amount monthly.",
    },
    {
      name: "revokeAccess",
      title: "Revoke platform access",
      titleBulk: "Revoke platform access",
      icon: faPowerOff,
      show: (client: Client) =>
        !["starting", "client"].includes(client.status as string) &&
        client.access_revoked_at == null &&
        client.user_id != null,
      apiOperation: "revoke_access",
      dialogTitle: "Revoke access for {{full_name}}",
      dialogTitleBulk: "Revoke access for {{n}} clients",
      dialogText:
        "Are you sure you would like to revoke platform access for {{full_name}}?",
      dialogTextBulk:
        "Are you sure you would like to revoke platform access for {{n}} clients?",
    },
    {
      name: "cancelOffer",
      title: "Cancel offer",
      titleBulk: "Cancel offers",
      icon: faXmark,
      show: (client: Client) => client.status === "offerSent",
      apiOperation: "cancel_offer",
      onComplete: onCancelClientOfferComplete,
      dialogTitle: "Cancel {{full_name}}'s offer",
      dialogTitleBulk: "Cancel {{n}} clients' offers",
      dialogText:
        "Are you sure you would like to cancel {{full_name}}'s offer?",
      dialogTextBulk:
        "Are you sure you would like to cancel {{n}} clients' offers?",
    },
    {
      name: "cancelSubscriptionSchedule",
      title: "Cancel starting client",
      titleBulk: "Cancel starting clients",
      icon: faXmark,
      show: (client: Client) => client.status === "starting",
      apiOperation: "cancel_start",
      onComplete: onCancelClientSubscriptionScheduleComplete,
      dialogTitle: "Cancel {{full_name}}'s start",
      dialogTitleBulk: "Cancel {{n}} clients' start",
      dialogText:
        "Are you sure you would like to cancel {{full_name}}'s start?",
      dialogTextBulk:
        "Are you sure you would like to cancel {{n}} clients' start?",
    },
    {
      name: "endSubscription",
      title: "End client",
      titleBulk: "End clients",
      icon: faXmark,
      show: (client: Client) =>
        ["past_due", "unpaid", "active", "trialing"].includes(
          client.subscription_status as string
        ),
      apiOperation: "cancel_subscription",
      onComplete: onCancelClientSubscriptionComplete,
      DialogForm: () => EndClientFields({}),
      dialogTitle: "End {{full_name}}'s subscription",
      dialogTitleBulk: "End {{n}} clients",
      dialogText:
        "Are you sure you would like to end {{full_name}}? The client will stop at the end of their monthly billing cycle.",
      dialogTextBulk:
        "Are you sure you would like to end {{n}} clients? Clients will stop at the end of their respective monthly billing cycles.",
    },
    {
      name: "archive",
      title: "Archive",
      titleBulk: "Archive",
      icon: faTrash,
      show: (client: Client) =>
        client.status === "lead" || client.subscription_status === "canceled",
      apiOperation: "archive",
      dialogTitle: "Archive {{full_name}}",
      dialogTitleBulk: "Archive {{n}} clients",
      dialogText: "Are you sure you would like to archive {{full_name}}?",
      dialogTextBulk: "Are you sure you would like to archive {{n}} clients?",
    },
  ];

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
      <>
        <ItemList<Client>
          title="Clients"
          filterStatusOptions={[
            { value: "lead", name: "Leads" },
            { value: "offerSent", name: "Sent Offers" },
            { value: "starting", name: "Starting" },
            { value: "client", name: "Active" },
            { value: "ended", name: "Ended" },
          ]}
          fetchItems={fetchClients}
          actions={actions}
          SearchInputComponent={SearchInput}
          FilterBarComponent={FilterBar}
          HeaderComponent={ClientsListHeader}
          CardComponent={ClientCard}
          EmptyListComponent={(props: EmptyListProps) => (
            <EmptyList {...props} user={user} />
          )}
        />
      </>
    </>
  );
};

export default withAuth(Clients, ["coach"]);
