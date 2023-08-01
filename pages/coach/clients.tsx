import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  cancelClientSubscription,
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";

import ItemList, { Action } from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import {
  faPaperPlane,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";
import PriceInput from "@/app/components/Form/PriceInput";
import Input from "@/app/components/Form/Input";

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

  const handleSendOfferToClient = async (
    client: Client,
    data: {
      monthlyAmount: number | string;
      trialPeriod: boolean;
      startDate: Date;
    }
  ) => {
    const { monthlyAmount, trialPeriod, startDate } = data;

    const { data: sendOfferData, error } = await sendClientOffer(
      client.id as UUID,
      {
        monthlyAmount: Number(monthlyAmount) * 100,
        currency: "USD",
        trialPeriodDays: trialPeriod ? 14 : 0,
        startDate: startDate || new Date(),
      }
    );

    if (error) {
      return { data: sendOfferData, error };
    }

    return { error: null };
  };

  const sendOfferToClientAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    return clientStatuses.length === 1 && clientStatuses[0] === "lead";
  };

  const cancelSubscriptionAllowed = (client: Client | Client[]) => {
    const clientSubscriptionStatuses = [
      ...new Set([client].flat().map((c) => c.subscription_status)),
    ];
    return clientSubscriptionStatuses.every((val?: string) =>
      ["past_due", "unpaid", "active", "trialing"].includes(val as string)
    );
  };

  const archiveClientAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    const clientSubscriptionStatuses = [
      ...new Set([client].flat().map((c) => c.subscription_status)),
    ];

    return (
      clientSubscriptionStatuses.every((val?: string) => val === "canceled") ||
      clientStatuses.every((val?: string) => val === "lead")
    );
  };

  const onSendOfferComplete = (
    setFilterStatus: (filterStatus: string) => void
  ) => setFilterStatus("offerSent");

  const handleArchiveClient = async (client: Client) => {
    const { data, error } = await updateClientById(client.id as UUID, {
      archived_at: new Date(),
    });
    return { data, error };
  };

  const handleCancelClientSubscription = async (
    client: Client,
    data: {
      endImmediately: boolean;
    }
  ) => {
    const { endImmediately } = data;
    return await cancelClientSubscription(client, endImmediately);
  };

  const actions: Action<Client>[] = [
    {
      name: "sendOffer",
      title: "Send offer",
      titleBulk: "Send offers",
      icon: faPaperPlane,
      show: sendOfferToClientAllowed,
      handler: handleSendOfferToClient,
      onComplete: onSendOfferComplete,
      DialogForm: () => (
        <>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
          <Input
            name="startDate"
            type="date"
            placeholder="Start date"
            defaultValue={new Date()}
          />
          <Input
            name="trialPeriod"
            type="checkbox"
            placeholder="Offer trial period (14 days)"
          />
        </>
      ),
      dialogTitle: (selectedClient: Client) =>
        `Send offer to ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Send offers to ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `${selectedClient.full_name} will receive an email with the link to subscribe and pay your specified amount monthly.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        "Your clients  will receive an email with the link to subscribe and pay your specified amount monthly.",
    },
    {
      name: "archive",
      title: "Archive",
      titleBulk: "Archive",
      icon: faTrash,
      show: archiveClientAllowed,
      handler: handleArchiveClient,
      dialogTitle: (selectedClient: Client) =>
        `Archive ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Archive ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to archive ${selectedClient.full_name}?`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to archive ${selectedClients.length} clients?`,
    },
    {
      name: "endSubscription",
      title: "End client",
      titleBulk: "End clients",
      icon: faXmark,
      show: cancelSubscriptionAllowed,
      handler: handleCancelClientSubscription,
      DialogForm: () => (
        <Input
          name="endImmediately"
          type="checkbox"
          placeholder="End immediately"
        />
      ),
      dialogTitle: (selectedClient: Client) =>
        `End ${selectedClient.full_name}'s subscription`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `End ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to end ${selectedClient.full_name}? The client will stop at the end of their monthly billing cycle.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to end ${selectedClients.length} clients? The client will be ended at the end of their respective monthly billing cycles.`,
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
