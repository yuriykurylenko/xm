import Modal from "react-modal";
import { useState } from "react";
import styles from "./styles.module.css";
import { sendClientOffer } from "@/app/utils/api";

Modal.setAppElement("#__next");

interface OfferModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedClient: any;
  user: any;
  onOfferSent?: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  closeModal,
  selectedClient,
  user,
  onOfferSent,
}) => {
  const [monthlyAmount, setMonthlyAmount] = useState(
    user.monthly_subscription_amount / 100
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onModalClose() {
    closeModal();
    setMonthlyAmount(user.monthly_subscription_amount / 100);
  }

  async function sendOffer(event: React.FormEvent) {
    setIsSubmitting(true);
    event.preventDefault();

    const { error } = await sendClientOffer((selectedClient as any)?.id, {
      monthlyAmount: Number(monthlyAmount) * 100,
      currency: "USD",
    });

    if (error) {
      setIsSubmitting(false);
    }

    onModalClose();

    setIsSubmitting(false);
    onOfferSent && onOfferSent();
  }

  return (
    <Modal
      isOpen={isOpen}
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
      <div
        className={`${styles["modal-container"]} ${styles["form-container"]}`}
      >
        <form onSubmit={sendOffer} className={styles["form"]}>
          <h2>Send offer to {selectedClient.full_name}</h2>
          <p>
            {selectedClient.full_name} will receive an email with the link to
            subscribe and pay your specified amount monthly.
          </p>
          <div className={styles["input-group"]}>
            <div className={styles["price-input"]}>
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
              disabled={isNaN(parseFloat(monthlyAmount as any)) || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Offer"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OfferModal;
