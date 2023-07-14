import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";
import ActionDialog from "@/app/components/ActionDialog";

import ItemList from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import { faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";
import PriceInput from "@/app/components/Form/PriceInput";
import Button from "@/app/components/Form/Button";

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
    data: { monthlyAmount: number | string }
  ) => {
    const { monthlyAmount } = data;

    const { data: sendOfferData, error } = await sendClientOffer(
      client.id as UUID,
      {
        monthlyAmount: Number(monthlyAmount) * 100,
        currency: "USD",
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

  const onSendOfferComplete = (
    setFilterStatus: (filterStatus: string) => void
  ) => setFilterStatus("offerSent");

  const handleArchiveClient = (client: Client) =>
    updateClientById(client.id as UUID, {
      archived_at: new Date(),
    });

  const actions = [
    {
      name: "sendOffer",
      title: "Send offer",
      titleBulk: "Send offers",
      icon: faPaperPlane,
      show: sendOfferToClientAllowed,
      handler: handleSendOfferToClient,
      onComplete: onSendOfferComplete,
      DialogComponent: ActionDialog,
      DialogForm: () => (
        <>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
        </>
      ),
      dialogTitle: (selectedItem: Client) =>
        `Send offer to ${selectedItem.full_name}`,
      dialogTitleBulk: (selectedItems: Client[]) =>
        `Send offers to ${selectedItems.length + " clients"}`,
      dialogText: (selectedItem: Client) =>
        `${selectedItem.full_name} will receive an email with the link to subscribe and pay your specified amount monthly.`,
      dialogTextBulk: (selectedItems: Client[]) =>
        "Your clients  will receive an email with the link to subscribe and pay your specified amount monthly.",
    },
    {
      name: "archive",
      title: "Archive",
      titleBulk: "Archive",
      icon: faTrash,
      show: (client: Client | Client[]) => true,
      handler: handleArchiveClient,
      DialogComponent: ActionDialog,
      dialogTitle: (selectedItem: Client) =>
        `Archive ${selectedItem.full_name}`,
      dialogTitleBulk: (selectedItems: Client[]) =>
        `Archive ${selectedItems.length + " clients"}`,
      dialogText: (selectedItem: Client) =>
        `Are you sure you would like to archive ${selectedItem.full_name}?`,
      dialogTextBulk: (selectedItems: Client[]) =>
        `Are you sure you would like to archive ${selectedItems.length} clients?`,
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
            { value: "client", name: "Active" },
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
