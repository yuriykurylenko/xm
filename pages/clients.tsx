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
import { User } from "@/app/types/user";
import { Client } from "@/app/types/client";

type FilterOption = {
  value: string;
  name: string;
};

const CLIENT_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", name: "All" },
  { value: "lead", name: "Leads" },
  { value: "offerSent", name: "Offer sent" },
  { value: "client", name: "Clients" },
];

const Clients = ({ user }: { user: User }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await fetchClientsByCoachId(user.id);
      setClients(data);
    })();
  }, [user, filterStatus]);

  function openModal(client: Client) {
    setIsModalOpen(true);
    setSelectedClient(client);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedClient(null);
  }

  const filteredClients = clients.filter((client: Client) => {
    if (filterStatus === "all") {
      return true;
    }
    return client.status === filterStatus;
  });

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
      <div className={styles["clients-container-header"]}>
        <h1>Clients</h1>
        <FilterBar
          filterOptions={CLIENT_STATUS_OPTIONS}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>
      <ItemList
        items={filteredClients}
        renderCard={(client: Client, index: number) => (
          <ClientCard
            key={index}
            client={client}
            onActionButtonClick={() => openModal(client)}
            actionButtonText="Send offer"
          />
        )}
        renderEmptyList={() => <EmptyList user={user} />}
      />
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
