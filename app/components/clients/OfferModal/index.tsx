import Modal from "react-modal";
import styles from "./styles.module.css";

Modal.setAppElement("#__next");

interface OfferModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSendOffer: (event: React.FormEvent) => Promise<void>;
  selectedClient: any;
  monthlyAmount: number | null;
  setMonthlyAmount: (amount: number) => void;
  isSubmitting: boolean;
}

const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  closeModal,
  onSendOffer,
  selectedClient,
  monthlyAmount,
  setMonthlyAmount,
  isSubmitting,
}) => {
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
      <div className="modal-container form-container">
        <form onSubmit={onSendOffer} className="form">
          <h2>Send offer to {selectedClient.full_name}</h2>
          <p>
            {selectedClient.full_name} will receive an email with the link to
            subscribe and pay your specified amount monthly.
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
