import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  cancelClientSubscription,
  cancelClientSubscriptionSchedule,
  changeClientSubscriptionAmount,
  changeClientSubscriptionSchedule,
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
  updateSubscriptionByClientId,
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

// TODO: extract
const startOfUtcDay = (date: Date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
};

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

  const handleArchiveClient = async (clientId: UUID) => {
    const { data, error } = await updateClientById(clientId, {
      archived_at: new Date(),
    });
    return { data, error };
  };

  const handleRevokeAccess = async (clientId: UUID) => {
    const { data, error } = await updateClientById(clientId, {
      access_revoked_at: new Date(),
    });
    return { data, error };
  };

  const handleCancelClientSubscription = async (
    clientId: UUID,
    data: {
      endImmediately: boolean;
      accessAfterEndDate: boolean;
    }
  ) => {
    const { endImmediately, accessAfterEndDate } = data;
    return await cancelClientSubscription(
      clientId,
      endImmediately,
      accessAfterEndDate
    );
  };

  const handleCancelClientSubscriptionSchedule = async (clientId: UUID) => {
    return await cancelClientSubscriptionSchedule(clientId);
  };

  const handleCancelClientOffer = async (clientId: UUID) => {
    await updateSubscriptionByClientId(clientId, {
      archived_at: new Date(),
      start_date: null,
      end_date: null,
    });
    return await updateClientById(clientId, {
      status: "lead",
      subscription_status: null,
      start_date: null,
      end_date: null,
    });
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
      handler: sendClientOffer,
      onComplete: onSendOfferComplete,
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: (client: Client) => `Send offer to ${client.full_name}`,
      dialogTitleBulk: (clients: Client[]) =>
        `Send offers to ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `${client.full_name} will receive an email with the link to subscribe and pay your specified amount monthly.`,
      dialogTextBulk: (clients: Client[]) =>
        "Your clients  will receive an email with the link to subscribe and pay your specified amount monthly.",
    },
    {
      name: "changeStartingSubscrition",
      title: "Change client's terms",
      titleBulk: "Change clients' terms",
      icon: faRotate,
      show: (client: Client) => client.status === "starting",
      handler: changeClientSubscriptionSchedule,
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: (client: Client) => `Change terms for ${client.full_name}`,
      dialogTitleBulk: (clients: Client[]) =>
        `Change terms ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `Please specify the new price and start date for ${client.full_name}. They will receive an email confirming the change of the terms but would not need to add their credit card again.`,
      dialogTextBulk: (clients: Client[]) =>
        "Please specify the new price and start date for selected clients. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "changeSubscritionAmount",
      title: "Change client's monthly price",
      titleBulk: "Change clients' monthly price",
      icon: faDollarSign,
      show: (client: Client) =>
        client.status === "client" && client.end_date === null,
      handler: changeClientSubscriptionAmount,
      DialogForm: ({ items }: { items: Client[] }) =>
        PriceField({ items, coach: user }),
      dialogTitle: (client: Client) => `Change price for ${client.full_name}`,
      dialogTitleBulk: (clients: Client[]) =>
        `Change price for ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `Please specify the new price for ${client.full_name}. They will receive an email confirming the change of the terms but would not need to add their credit card again.`,
      dialogTextBulk: (clients: Client[]) =>
        "Please specify the new price for selected clients. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "renewSubscrition",
      title: "Renew client's subscription",
      titleBulk: "Renew clients' subscriptions",
      icon: faRotate,
      show: (client: Client) =>
        client.status === "client" && client.end_date != null,
      handler: changeClientSubscriptionAmount,
      DialogForm: ({ items }: { items: Client[] }) =>
        PriceField({ items, coach: user }),
      dialogTitle: (client: Client) =>
        `Renew ${client.full_name}'s subscription`,
      dialogTitleBulk: (clients: Client[]) =>
        `Renew ${clients.length + " clients'"} subscriptions`,
      dialogText: (client: Client) =>
        `Your client's subscription will be renewed. You can specify the new price for ${client.full_name}. They will receive an email confirming the change of the terms but would not need to add their credit card again.`,
      dialogTextBulk: (clients: Client[]) =>
        "Your clients' subscriptions will be renewed. You can specify the new price for them. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "resendOffer",
      title: "Send a new offer",
      titleBulk: "Send new offers",
      icon: faRotate,
      show: (client: Client) =>
        ["offerSent", "ended"].includes(client.status as string),
      handler: sendClientOffer,
      onComplete: onSendOfferComplete,
      DialogForm: ({ items }: { items: Client[] }) =>
        ClientTermsFormFields({ items, coach: user }),
      dialogTitle: (client: Client) =>
        `Send a new offer to ${client.full_name}`,
      dialogTitleBulk: (clients: Client[]) =>
        `Send new offers to ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `${
          client.full_name
        } will receive an email with the link to subscribe and pay your specified amount monthly. ${
          client.status === "offerSent"
            ? "Your previous offer to the client will be canceled."
            : ""
        }`,
      dialogTextBulk: (clients: Client[]) =>
        `Your clients will receive an email with the link to subscribe and pay your specified amount monthly. ${
          clients.every((sc) => sc.status === "offerSent")
            ? "Your previous offers to them will be canceled."
            : ""
        }`,
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
      handler: handleRevokeAccess,
      dialogTitle: (client: Client) => `Revoke access for ${client.full_name}`,
      dialogTitleBulk: (clients: Client[]) =>
        `Revoke access for ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `Are you sure you would like to revoke platform access for ${client.full_name}?`,
      dialogTextBulk: (clients: Client[]) =>
        `Are you sure you would like to revoke platform access for ${clients.length} clients?`,
    },
    {
      name: "cancelOffer",
      title: "Cancel offer",
      titleBulk: "Cancel offers",
      icon: faXmark,
      show: (client: Client) => client.status === "offerSent",
      handler: handleCancelClientOffer,
      onComplete: onCancelClientOfferComplete,
      dialogTitle: (client: Client) => `Cancel ${client.full_name}'s offer`,
      dialogTitleBulk: (clients: Client[]) =>
        `Cancel ${clients.length + " clients' offers"}`,
      dialogText: (client: Client) =>
        `Are you sure you would like to cancel ${client.full_name}'s offer?`,
      dialogTextBulk: (clients: Client[]) =>
        `Are you sure you would like to cancel ${clients.length} clients' offers?`,
    },
    {
      name: "cancelSubscriptionSchedule",
      title: "Cancel starting client",
      titleBulk: "Cancel starting clients",
      icon: faXmark,
      show: (client: Client) => client.status === "starting",
      handler: handleCancelClientSubscriptionSchedule,
      onComplete: onCancelClientSubscriptionScheduleComplete,
      dialogTitle: (client: Client) => `Cancel ${client.full_name}'s start`,
      dialogTitleBulk: (clients: Client[]) =>
        `Cancel ${clients.length + " clients' start"}`,
      dialogText: (client: Client) =>
        `Are you sure you would like to cancel ${client.full_name}'s start?`,
      dialogTextBulk: (clients: Client[]) =>
        `Are you sure you would like to cancel ${clients.length} clients' start?`,
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
      handler: handleCancelClientSubscription,
      onComplete: onCancelClientSubscriptionComplete,
      DialogForm: () => EndClientFields({}),
      dialogTitle: (client: Client) => `End ${client.full_name}'s subscription`,
      dialogTitleBulk: (clients: Client[]) =>
        `End ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `Are you sure you would like to end ${client.full_name}? The client will stop at the end of their monthly billing cycle.`,
      dialogTextBulk: (clients: Client[]) =>
        `Are you sure you would like to end ${clients.length} clients? The client will be ended at the end of their respective monthly billing cycles.`,
    },
    {
      name: "archive",
      title: "Archive",
      titleBulk: "Archive",
      icon: faTrash,
      show: (client: Client) =>
        client.status === "lead" || client.subscription_status === "canceled",
      handler: handleArchiveClient,
      dialogTitle: (client: Client) => `Archive ${client.full_name}`,
      dialogTitleBulk: (clients: Client[]) =>
        `Archive ${clients.length + " clients"}`,
      dialogText: (client: Client) =>
        `Are you sure you would like to archive ${client.full_name}?`,
      dialogTextBulk: (clients: Client[]) =>
        `Are you sure you would like to archive ${clients.length} clients?`,
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
