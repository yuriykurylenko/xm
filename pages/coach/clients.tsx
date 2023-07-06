import * as React from "react";
import { useEffect, useState } from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import { fetchClientsByCoachId, updateClientById } from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";
import OfferModal from "@/app/components/clients/OfferModal";

import styles from "@/app/styles/clients.module.css";
import ItemList from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSearch,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import ActionsBar from "@/app/components/clients/ActionsBar";
import Pagination from "@/app/components/Pagination";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";

type FilterOption = {
  value: string;
  name: string;
};

const Clients = ({ user }: { user: Coach }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>("lead");
  const [filterText, setFilterText] = useState<string>("");

  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({
    lead: 0,
    offerSent: 0,
    client: 0,
  });

  const [isListLoaded, setIsListLoaded] = useState<boolean>(false);

  const CLIENT_STATUS_OPTIONS: FilterOption[] = [
    { value: "lead", name: "Leads" },
    { value: "offerSent", name: "Sent Offers" },
    { value: "client", name: "Active" },
  ];

  const ACTIONS = [
    {
      title: "Send offer",
      titleBulk: "Send offers",
      icon: <FontAwesomeIcon icon={faPaperPlane} />,
      handler: (client: Client | Client[]) => openOfferModal(client),
      show: filterStatus === "lead",
    },
    {
      title: "Archive client",
      titleBulk: "Archive clients",
      icon: <FontAwesomeIcon icon={faTrash} />,
      handler: (client: Client | Client[]) => handleArchiveConfirmation(client),
      show: true,
    },
  ];

  const fetchClients = async (defaultPage?: number) => {
    setIsListLoaded(false);

    const { data, total } = await fetchClientsByCoachId(
      user.id as UUID,
      defaultPage || page,
      filterStatus,
      filterText
    );

    setClients(data as Client[]);
    setTotalClients(total || 0);
    setIsListLoaded(true);
  };

  const changeFilterStatus = (status: string) => {
    if (status !== filterStatus) {
      setIsListLoaded(false);
    }
    setFilterStatus(status);
  };

  useEffect(() => {
    setPage(1);
    setSelectedClients([]);

    (async () => {
      fetchClients(1);
    })();
  }, [filterStatus, filterText]);

  useEffect(() => {
    setIsListLoaded(false);
    (async () => {
      fetchClients();
    })();
  }, [user, page]);

  useEffect(() => {
    updateFilterCounts();
  }, [user]);

  const openOfferModal = (client: Client | Client[]) => {
    setIsOfferModalOpen(true);
    setSelectedClients([client].flat());
  };

  const closeOfferModal = () => {
    setIsOfferModalOpen(false);
    setSelectedClients([]);
    updateFilterCounts();
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  const handleArchiveClient = async (client: Client) => {
    await updateClientById(client.id as UUID, { archived_at: new Date() });
    await fetchClients();
    await updateFilterCounts();
  };

  const handleArchiveConfirmation = (client?: Client | Client[]) => {
    setIsConfirmationDialogOpen(true);

    if (client) {
      setSelectedClients([client].flat());
    }
  };

  const handleArchiveSelectedClients = async () => {
    for (const client of selectedClients) {
      handleArchiveClient(client);
    }

    setSelectedClients([]);
    setIsConfirmationDialogOpen(false);
  };

  const handleCancelAction = () => {
    setSelectedClients([]);
    setIsConfirmationDialogOpen(false);
  };

  const updateFilterCounts = async () => {
    const counts: Record<string, number> = {};

    for (const filterOption of CLIENT_STATUS_OPTIONS) {
      const { total } = await fetchClientsByCoachId(
        user.id as UUID,
        1,
        filterOption.value
      );
      counts[filterOption.value] = total as number;
    }

    setFilterCounts(counts);
  };

  const onClientSelect = (client: Client) => {
    selectedClients.map((c) => c.id).includes(client.id)
      ? setSelectedClients(selectedClients.filter((c) => c.id !== client.id))
      : setSelectedClients([...selectedClients, client]);
  };

  const onClientsBulkSelect = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients);
    }
  };

  const filteredClients = clients.filter((client: Client) => {
    return client.status === filterStatus;
  });

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
      <>
        <div className={styles["clients-container-header"]}>
          <div className={styles["clients-title-container"]}>
            <h1>Clients</h1>
            <SearchInput
              value={filterText}
              onChange={setFilterText}
              placeholder={`Search in ${
                CLIENT_STATUS_OPTIONS.find((o) => o.value === filterStatus)
                  ?.name
              }`}
            />
          </div>
          <FilterBar
            filterOptions={CLIENT_STATUS_OPTIONS.map((option) => ({
              ...option,
              count: filterCounts[option.value],
            }))}
            filterStatus={filterStatus}
            setFilterStatus={changeFilterStatus}
          />
        </div>
        <ItemList<Client>
          isListLoaded={isListLoaded}
          items={filteredClients}
          renderHeader={() => (
            <ClientsListHeader
              onBulkSelect={onClientsBulkSelect}
              selectedClients={selectedClients}
              actions={ACTIONS}
            />
          )}
          renderCard={(client: Client, index: number) => (
            <ClientCard
              key={index}
              client={client}
              selectedClients={selectedClients}
              bulkOperationsAllowed={true}
              onClientSelect={() => onClientSelect(client)}
              actions={ACTIONS}
            />
          )}
          renderEmptyList={() => (
            <EmptyList user={user} isSearchResult={filterText !== ""} />
          )}
          renderPagination={() => (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalClients / 20)}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          )}
        />
      </>
      {selectedClients.length > 0 && (
        <OfferModal
          isOpen={isOfferModalOpen}
          closeModal={closeOfferModal}
          onOfferSent={() => setFilterStatus("offerSent")}
          selectedClients={selectedClients}
          user={user}
        />
      )}
      {isConfirmationDialogOpen && (
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          message={`Would you like to archive ${
            selectedClients.length === 1
              ? selectedClients[0].full_name
              : selectedClients.length + " clients"
          }?`}
          onConfirm={handleArchiveSelectedClients}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );
};

export default withAuth(Clients, ["coach"]);
