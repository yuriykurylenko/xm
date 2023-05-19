import { SetStateAction, useEffect, useState } from "react";
import styles from "@/app/styles/clientsList.module.css";
import Modal from "react-modal";
import "@/app/globals.css";
import Head from "next/head";
import withAuth from "@/app/components/withAuth";
import { fetchClientsByCoachId, sendClientOffer } from "@/app/utils/api";
import FilterBar from "@/app/components/clients/FilterBar";
import ClientList from "@/app/components/clients/ClientList";

Modal.setAppElement("#__next");

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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Send Offer Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            maxWidth: "300px",
            margin: "0 auto",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "4px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Arial, sans-serif",
          },
        }}
      >
        <div className="modal-container form-container">
          <form onSubmit={onSendOffer} className="form">
            <h2>Send offer to {(selectedClient as any)?.full_name}</h2>
            <p>
              {(selectedClient as any)?.full_name} will receive an email with
              the link to subscribe and pay your specified amount monthly.
            </p>
            <div className="input-group">
              <div className="price-input">
                <input
                  type="number"
                  placeholder="Monthly price"
                  id="monthlyPrice"
                  name="monthlyPrice"
                  min="0"
                  step="0.01"
                  value={parseFloat(monthlyAmount as any)}
                  onChange={(event) => {
                    setMonthlyAmount(parseFloat(event.target.value) as any);
                  }}
                />
              </div>
            </div>
            <div>
              <button
                className={`${styles["filter-btn"]} ${styles["filter-btn-modal"]}`}
                onClick={closeModal}
              >
                Close
              </button>
              <button
                className={`${styles.btn} ${styles["btn-modal"]}`}
                type="submit"
                disabled={
                  isNaN(parseFloat(monthlyAmount as any)) || isSubmitting
                }
              >
                {isSubmitting ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default withAuth(Clients, ["coach"]);
