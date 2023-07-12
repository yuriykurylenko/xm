import * as React from "react";
import { useState } from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import { fetchClientsByCoachId, updateClientById } from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";
import OfferModal from "@/app/components/clients/OfferModal";

import ItemList from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList from "@/app/components/clients/EmptyList";
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
  const [page, setPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>("lead");
  const [filterText, setFilterText] = useState<string>("");

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
      show: (filterStatus: string) => filterStatus === "lead",
      renderDialog: (
        selectedClients: Client[],
        isOfferModalOpen: boolean,
        onCancel: () => void
      ) => (
        <OfferModal
          isOpen={isOfferModalOpen}
          closeModal={onCancel}
          onOfferSent={() => setFilterStatus("offerSent")}
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
      show: (filterStatus: string) => true,
      handler: (client: Client) => handleArchiveClient(client),
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

  const handleArchiveClient = async (client: Client) => {
    await updateClientById(client.id as UUID, { archived_at: new Date() });
  };

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
          renderSearchInput={(
            filterText: string,
            setFilterText: (value: string) => void,
            filterStatus: string
          ) => (
            <SearchInput
              value={filterText}
              onChange={setFilterText}
              placeholder={`Search in ${
                CLIENT_STATUS_OPTIONS.find((o) => o.value === filterStatus)
                  ?.name
              }`}
            />
          )}
          renderFilterBar={(
            filterStatus: string,
            changeFilterStatus: (status: string) => void,
            filterOptions,
            filterCounts
          ) => (
            <FilterBar
              filterOptions={filterOptions.map((option: FilterOption) => ({
                ...option,
                count: filterCounts[option.value],
              }))}
              filterStatus={filterStatus}
              setFilterStatus={changeFilterStatus}
            />
          )}
          renderHeader={(
            handleSort: (column: string) => void,
            sortColumn: string,
            sortDirection: "desc" | "asc",
            onClientsBulkSelect: () => void,
            selectedClients: Client[],
            filterStatus: string,
            actions: any,
            openActionDialogs: string[]
          ) => (
            <ClientsListHeader
              onBulkSelect={onClientsBulkSelect}
              selectedClients={selectedClients}
              actions={actions}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              filterStatus={filterStatus}
              openActionDialogs={openActionDialogs}
            />
          )}
          renderCard={(
            client: Client,
            index: number,
            selectedClients: Client[],
            onClientSelect: (client: Client) => void,
            filterStatus: string,
            actions: any
          ) => (
            <ClientCard
              key={index}
              client={client}
              selectedClients={selectedClients}
              bulkOperationsAllowed={true}
              onClientSelect={() => onClientSelect(client)}
              actions={actions}
              filterStatus={filterStatus}
            />
          )}
          renderEmptyList={() => (
            <EmptyList user={user} isSearchResult={filterText !== ""} />
          )}
        />
      </>
    </>
  );
};

export default withAuth(Clients, ["coach"]);
