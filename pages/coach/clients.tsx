import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";

import ItemList from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import {
  IconDefinition,
  faPaperPlane,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";
import PriceInput from "@/app/components/Form/PriceInput";

type Action<T = any, U = any> = {
  name: string;
  title: string;
  titleBulk: string;
  icon: IconDefinition;
  show: (client: Client | Client[]) => boolean;
  handler: (client: Client, data: T) => Promise<U>;
  onComplete?: (setFilterStatus: (filterStatus: string) => void) => void;
  DialogForm?: React.ComponentType;
  dialogTitle: (selectedClient: Client) => string;
  dialogTitleBulk: (selectedClients: Client[]) => string;
  dialogText: (selectedClient: Client) => string;
  dialogTextBulk: (selectedClients: Client[]) => string;
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

  const handleArchiveClient = async (client: Client) => {
    const { data, error } = await updateClientById(client.id as UUID, {
      archived_at: new Date(),
    });
    return { data, error };
  };

  const actions: Action[] = [
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
      show: (client: Client | Client[]) => true,
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
