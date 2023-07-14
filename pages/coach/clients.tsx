import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";
import OfferModal from "@/app/components/clients/OfferModal";

import ItemList from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";

type FilterOption = {
  value: string;
  name: string;
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

  const handleArchiveClient = (client: Client) =>
    updateClientById(client.id as UUID, {
      archived_at: new Date(),
    });

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

  const CLIENT_STATUS_OPTIONS: FilterOption[] = [
    { value: "lead", name: "Leads" },
    { value: "offerSent", name: "Sent Offers" },
    { value: "client", name: "Active" },
  ];

  const ACTIONS = [
    {
      name: "sendOffer",
      title: "Send offer",
      titleBulk: "Send offers",
      icon: <FontAwesomeIcon icon={faPaperPlane} />,
      show: (client: Client | Client[]) => {
        const clientStatuses = [
          ...new Set([client].flat().map((c) => c.status)),
        ];
        return clientStatuses.length === 1 && clientStatuses[0] === "lead";
      },
      handler: handleSendOfferToClient,
      onComplete: (setFilterStatus: (filterStatus: string) => void) =>
        setFilterStatus("offerSent"),
      renderDialog: (
        selectedClients: Client[],
        isOfferModalOpen: boolean,
        onCancel: () => void,
        onConfirm: (data: { monthlyAmount: number | string }) => Promise<any>
      ) => (
        <OfferModal
          isOpen={isOfferModalOpen}
          closeModal={onCancel}
          onConfirm={onConfirm}
          selectedClients={selectedClients}
          user={user}
        />
      ),
    },
    {
      name: "archive",
      title: "Archive client",
      titleBulk: "Archive clients",
      icon: <FontAwesomeIcon icon={faTrash} />,
      show: (client: Client | Client[]) => true,
      handler: handleArchiveClient,
      renderDialog: (
        selectedClients: Client[],
        isConfirmationDialogOpen: boolean,
        onCancel: () => void,
        onConfirm: () => void
      ) => (
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          message={`Would you like to archive ${
            selectedClients.length === 1
              ? selectedClients[0].full_name
              : selectedClients.length + " clients"
          }?`}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ),
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
          filterStatusOptions={CLIENT_STATUS_OPTIONS}
          fetchItems={fetchClients}
          actions={ACTIONS}
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
