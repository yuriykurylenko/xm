import Modal from "react-modal";
import { useState } from "react";
import { sendClientOffer } from "@/app/utils/api";

import Form, { Button, Input } from "@/app/components/Form";
import styles from "@/app/components/Form/styles.module.css";

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
  const [error, setError] = useState<string | null>(null);

  async function onModalClose() {
    closeModal();
    setMonthlyAmount(user.monthly_subscription_amount / 100);
    setError(null);
  }

  async function onSubmit(data: any) {
    setIsSubmitting(true);

    const { monthlyAmount } = data;
    const { error } = await sendClientOffer((selectedClient as any)?.id, {
      monthlyAmount: Number(monthlyAmount) * 100,
      currency: "USD",
    });

    if (error) {
      setIsSubmitting(false);
      setError(error);
      return;
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
          maxWidth: "510px",
          height: "fit-content",
          margin: "0 auto",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className={styles["form-container"]}>
        <div className={styles["form-wrapper"]}>
          <Form onSubmit={onSubmit}>
            <h2 className={styles["form-header"]}>
              Send offer to {selectedClient.full_name}
            </h2>
            <p>
              {selectedClient.full_name} will receive an email with the link to
              subscribe and pay your specified amount monthly.
            </p>
            <Input
              type="number"
              placeholder="Monthly price"
              name="monthlyAmount"
              defaultValue={user.monthly_subscription_amount / 100}
              className={styles["price-input"]}
              required
            />
            <Button
              type="submit"
              disabled={isNaN(parseFloat(monthlyAmount as any)) || isSubmitting}
              error={error || ""}
            >
              {isSubmitting ? "Sending..." : "Send Offer"}
            </Button>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default OfferModal;
