import * as React from "react";
import { useEffect, useState } from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import { fetchClientsByCoachId } from "@/app/utils/api";
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
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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

  useEffect(() => {
    (async () => {
      const { data, total } = await fetchClientsByCoachId(
        user.id as UUID,
        page,
        filterStatus
      );
      setClients(data as Client[]);
      setTotalClients(total || 0);
    })();
  }, [user, filterStatus, page]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  useEffect(() => {
    const fetchFilterCounts = async () => {
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

    fetchFilterCounts();
  }, [user]);

  const openModal = (client: Client) => {
    setIsModalOpen(true);
    setSelectedClients([client]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClients([]);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
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
        <h1>Clients</h1>
        {selectedClients.length > 0 ? (
          <BasicButton
            className={styles["action-btn"]}
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </BasicButton>
        ) : (
          <></>
        )}
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
            {filterStatus === "lead" && (
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
            )}
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
            <div className={styles["header-column"]}>Status</div>
            <div className={styles["header-column"]}>Actions</div>
          </div>
        )}
        renderCard={(client: Client, index: number) => (
          <ClientCard
            key={index}
            client={client}
            onActionButtonClick={() => openModal(client)}
            actionButtonText={<FontAwesomeIcon icon={faPaperPlane} />}
            selectedClients={selectedClients}
            bulkOperationsAllowed={filterStatus === "lead"}
            onClientSelect={() => {
              selectedClients.map((c) => c.id).includes(client.id)
                ? setSelectedClients(
                    selectedClients.filter((c) => c.id !== client.id)
                  )
                : setSelectedClients([...selectedClients, client]);
            }}
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
    </>
  );
};

export default withAuth(Clients, ["coach"]);
