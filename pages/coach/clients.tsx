import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";
import OfferModal, {
  OfferModalProps,
} from "@/app/components/clients/OfferModal";

import ItemList from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog, {
  ConfirmationDialogProps,
} from "@/app/components/ConfirmationDialog";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";

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
      icon: <FontAwesomeIcon icon={faPaperPlane} />,
      show: sendOfferToClientAllowed,
      handler: handleSendOfferToClient,
      onComplete: onSendOfferComplete,
      DialogComponent: (props: OfferModalProps) => (
        <OfferModal {...props} user={user} />
      ),
    },
    {
      name: "archive",
      title: "Archive client",
      titleBulk: "Archive clients",
      icon: <FontAwesomeIcon icon={faTrash} />,
      show: (client: Client | Client[]) => true,
      handler: handleArchiveClient,
      DialogComponent: (props: ConfirmationDialogProps) => (
        <ConfirmationDialog
          {...props}
          message={`Would you like to archive ${
            props.selectedItems.length === 1
              ? props.selectedItems[0].full_name
              : props.selectedItems.length + " clients"
          }?`}
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
