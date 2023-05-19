import { SetStateAction, useEffect, useState } from "react";
import styles from "@/app/styles/clientsList.module.css";
import "@/app/globals.css";
import Head from "next/head";
import withAuth from "@/app/components/withAuth";
import { fetchClientsByCoachId, sendClientOffer } from "@/app/utils/api";
import FilterBar from "@/app/components/clients/FilterBar";
import ClientList from "@/app/components/clients/ClientList";
import OfferModal from "@/app/components/clients/OfferModal";

const Clients = ({ user }: { user: any }) => {
  const [clients, setClients] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [monthlyAmount, setMonthlyAmount] =
    useState<SetStateAction<null | number>>(null);

  useEffect(() => {
    (async () => {
      const { data } = await fetchClientsByCoachId((user as any).id);
      setClients(data);
    })();
    setMonthlyAmount((user as any).monthly_subscription_amount / 100);
  }, [user, filterStatus]);

  function openModal(client: any) {
    setIsModalOpen(true);
    setSelectedClient(client);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedClient(null);
  }

  async function createSubscription(clientId: any, monthlyAmount: any) {
    const { data, error } = await sendClientOffer(clientId, {
      monthlyAmount,
      currency: "USD",
    });
    if (error) {
      setIsSubmitting(false);
    }

    return data?.[0];
  }

  async function onSendOffer(event: any) {
    setIsSubmitting(true);
    event.preventDefault();

    await createSubscription(
      (selectedClient as any)?.id,
      Number(monthlyAmount) * 100
    );

    closeModal();

    const coachMonthlySubscriptionAmount = (user as any)
      ?.monthly_subscription_amount;
    if (coachMonthlySubscriptionAmount) {
      setMonthlyAmount(coachMonthlySubscriptionAmount / 100);
    }

    setIsSubmitting(false);
    setFilterStatus("offerSent");
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
      <ClientList
        clients={filteredClients}
        user={user}
        onSendOfferClick={openModal}
      />
      {selectedClient && (
        <OfferModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          onSendOffer={onSendOffer}
          selectedClient={selectedClient}
          monthlyAmount={Number(monthlyAmount)}
          setMonthlyAmount={setMonthlyAmount}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default withAuth(Clients, ["coach"]);
