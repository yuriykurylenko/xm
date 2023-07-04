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
import BasicButton from "@/app/components/BasicButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

type FilterOption = {
  value: string;
  name: string;
};

const Clients = ({ user }: { user: Coach }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>("lead");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({
    lead: 0,
    offerSent: 0,
    client: 0,
  });

  const CLIENT_STATUS_OPTIONS: FilterOption[] = [
    { value: "lead", name: `Leads (${filterCounts.lead})` },
    { value: "offerSent", name: `Sent offers (${filterCounts.offerSent})` },
    { value: "client", name: `Active (${filterCounts.client})` },
  ];

  const ACTIONS = [
    {
      title: "Send offer",
      titleBulk: "Send offers",
      icon: <FontAwesomeIcon icon={faPaperPlane} />,
      handler: (client: Client | Client[]) => openModal(client),
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

  const fetchClients = async () => {
    const { data, total } = await fetchClientsByCoachId(
      user.id as UUID,
      page,
      filterStatus
    );
    setClients(data as Client[]);
    setTotalClients(total || 0);
  };

  useEffect(() => {
    (async () => {
      fetchClients();
    })();
  }, [user, filterStatus, page]);

  useEffect(() => {
    setSelectedClients([]);
  }, [filterStatus]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  useEffect(() => {
    updateFilterCounts();
  }, [user]);

  const openModal = (client: Client | Client[]) => {
    setIsModalOpen(true);
    setSelectedClients([client].flat());
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
    console.log(client);
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

  const filteredClients = clients.filter((client: Client) => {
    return client.status === filterStatus;
  });

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
      <div className={styles["clients-container-header"]}>
        <div className={styles["clients-title-container"]}>
          <h1>Clients</h1>
          {selectedClients.length > 0 ? (
            <div className={styles["action-buttons-container"]}>
              {ACTIONS.map(
                (action: any, i: number) =>
                  action.show && (
                    <span title={action.titleBulk} key={i}>
                      <BasicButton
                        className={styles["action-btn"]}
                        onClick={() => action.handler(selectedClients)}
                      >
                        {action.icon}
                      </BasicButton>
                    </span>
                  )
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
        <FilterBar
          filterOptions={CLIENT_STATUS_OPTIONS.map((option) => ({
            ...option,
            count: filteredClients.filter(
              (client) => client.status === option.value
            ).length,
          }))}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>
      <ItemList<Client>
        items={filteredClients}
        renderHeader={() => (
          <div className={styles["header-row"]}>
            <div
              className={`${styles["header-column"]} ${styles["header-column-bulk"]}`}
            >
              <input
                type="checkbox"
                checked={selectedClients.length === filteredClients.length}
                onChange={() => {
                  if (selectedClients.length === filteredClients.length) {
                    setSelectedClients([]);
                  } else {
                    setSelectedClients(filteredClients);
                  }
                }}
              />
            </div>
            <div
              className={`${styles["header-column"]} ${styles["header-column-avatar"]}`}
            >
              &nbsp;
            </div>
            <div
              className={`${styles["header-column"]} ${styles["header-column-name"]}`}
            >
              Name
            </div>
            <div
              className={`${styles["header-column"]} ${styles["header-column-created"]}`}
            >
              Created
            </div>
            <div className={styles["header-column"]}>Actions</div>
          </div>
        )}
        renderCard={(client: Client, index: number) => (
          <ClientCard
            key={index}
            client={client}
            selectedClients={selectedClients}
            bulkOperationsAllowed={true}
            onClientSelect={() => {
              selectedClients.map((c) => c.id).includes(client.id)
                ? setSelectedClients(
                    selectedClients.filter((c) => c.id !== client.id)
                  )
                : setSelectedClients([...selectedClients, client]);
            }}
            actions={ACTIONS}
          />
        )}
        renderEmptyList={() => <EmptyList user={user} />}
        renderPagination={() => (
          <div className={styles["pagination-container"]}>
            <BasicButton onClick={handlePrevPage} disabled={page === 1}>
              Previous
            </BasicButton>
            <span>
              Page <strong>{page}</strong> of{" "}
              <strong>{Math.ceil(totalClients / 10)}</strong>
            </span>
            <BasicButton
              onClick={handleNextPage}
              disabled={page >= Math.ceil(totalClients / 10)}
            >
              Next
            </BasicButton>
          </div>
        )}
      />
      {selectedClients.length > 0 && (
        <OfferModal
          isOpen={isModalOpen}
          closeModal={closeModal}
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
