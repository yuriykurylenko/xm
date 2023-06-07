import { useEffect, useState } from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import { fetchClientsByCoachId } from "@/app/utils/api";
import FilterBar from "@/app/components/clients/FilterBar";
import OfferModal from "@/app/components/clients/OfferModal";

import styles from "@/app/components/clients/ClientList/styles.module.css";
import ItemList from "@/app/components/ItemList";

const Clients = ({ user }: { user: any }) => {
  const [clients, setClients] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await fetchClientsByCoachId((user as any).id);
      setClients(data);
    })();
  }, [user, filterStatus]);

  function openModal(client: any) {
    setIsModalOpen(true);
    setSelectedClient(client);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedClient(null);
  }

  const filteredClients = clients.filter((client) => {
    if (filterStatus === "all") {
      return true;
    }
    return (client as any).status === filterStatus;
  });

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
      <div className={styles["clients-container-header"]}>
        <h1>Clients</h1>
        <FilterBar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>
      <ItemList
        entities={filteredClients}
        user={user}
        onActionButtonClick={openModal}
        actionButtonText="Send offer"
      >
        <div className={styles["no-item-container"]}>
          Please share this link to get your clients to apply for coaching:
          <br />
          <a
            href={`${window.location.protocol}//${window.location.host}/${
              (user as any).slug
            }/apply`}
          >
            {`${window.location.protocol}//${window.location.host}/${
              (user as any).slug
            }/apply`}
          </a>
        </div>
      </ItemList>
      {selectedClient && (
        <OfferModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          onOfferSent={() => setFilterStatus("offerSent")}
          selectedClient={selectedClient}
          user={user}
        />
      )}
    </>
  );
};

export default withAuth(Clients, ["coach"]);
