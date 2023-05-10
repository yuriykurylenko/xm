import { SetStateAction, useEffect, useState } from "react";
import styles from "@/app/styles/clientsList.module.css";
import supabase from "@/app/utils/supabaseClient";
import router from "next/router";
import Modal from "react-modal";
import "@/app/globals.css";

Modal.setAppElement("#__next");

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [coach, setCoach] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [monthlyAmount, setMonthlyAmount] =
    useState<SetStateAction<null | number>>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  function openModal(client: any) {
    setIsModalOpen(true);
    setSelectedClient(client);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedClient(null);
  }

  async function createSubscription(clientId: any, monthlyAmount: any) {
    try {
      const { data, error } = await supabase.from("subscriptions").insert([
        {
          client_id: clientId,
          monthly_amount: monthlyAmount,
        },
      ]);

      if (error) {
        console.error("Error creating subscription:", error);
      } else {
        const { error: updateError } = await supabase
          .from("clients")
          .update({ status: "offerSent" })
          .eq("id", clientId);

        if (updateError) {
          console.error("Error updating client status:", updateError);
        }
      }

      return data;
    } catch (error) {
      console.error("Error creating subscription:", error);
    }
  }

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", user.id);

      if (data[0]?.id) {
        setCoach(data[0]);
        await fetchClients(data[0]?.id);
        setMonthlyAmount((data[0] as any)?.monthly_subscription_amount / 100);
      }
    } else {
      router.push("/signup");
    }
  }

  async function fetchClients(coachId: any) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("coach_id", coachId);

    if (error) {
      console.error("Error fetching clients:", error);
    } else {
      setClients(data);
    }
  }

  async function onSendOffer(event: any) {
    event.preventDefault();
    await createSubscription(
      (selectedClient as any)?.id,
      Number(monthlyAmount) * 100
    );

    closeModal();
    const coachMonthlySubscriptionAmount = (coach as any)
      ?.monthly_subscription_amount;
    if (coachMonthlySubscriptionAmount) {
      setMonthlyAmount(coachMonthlySubscriptionAmount / 100);
    }

    setFilterStatus("offerSent");
    await fetchClients((coach as any)?.id);
  }

  const filteredClients = clients.filter((client) => {
    if (filterStatus === "all") {
      return true;
    }
    return (client as any).status === filterStatus;
  });

  return (
    <>
      <div className={styles["clients-container-header"]}>
        <h1>Clients</h1>
        <div>
          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "all" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "lead" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("lead")}
          >
            Leads
          </button>
          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "offerSent" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("offerSent")}
          >
            Offer Sent
          </button>

          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "client" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("client")}
          >
            Clients
          </button>
        </div>
      </div>
      <div className={styles["clients-container"]}>
        {clients.length > 0
          ? (filteredClients as any).map((client: any) => (
              <div key={(client as any).id} className={styles["client-item"]}>
                <div className={styles["avatar"]}>
                  {(client as any).full_name.charAt(0)}
                </div>
                <div className={styles["client-name"]}>
                  {(client as any).full_name}
                </div>
                {(client as any).status === "lead" && (
                  <button
                    className={styles.btn}
                    onClick={() => openModal(client)}
                  >
                    Send Offer
                  </button>
                )}
                {(client as any).status === "offerSent" && (
                  <div className={styles["offer-sent"]}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="green"
                      className={styles["check-icon"]}
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Offer sent
                  </div>
                )}
              </div>
            ))
          : coach && (
              <div className={styles["no-clients-container"]}>
                Please share this link to get your clients to sign up:
                <br />
                <a
                  href={`${window.location.protocol}//${window.location.host}/${
                    (coach as any).slug
                  }/signup`}
                >
                  {`${window.location.protocol}//${window.location.host}/${
                    (coach as any).slug
                  }/signup`}
                </a>
              </div>
            )}
      </div>
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
            maxHeight: "150px",
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
                disabled={isNaN(parseFloat(monthlyAmount as any))}
              >
                Send Offer
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default ClientsList;
