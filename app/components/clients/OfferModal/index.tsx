import Modal from "react-modal";
import { useState } from "react";
import { sendClientOffer } from "@/app/utils/api";

import Form from "@/app/components/Form";
import PriceInput from "@/app/components/Form/PriceInput";
import Button from "@/app/components/Form/Button";
import PageContainer from "@/app/components/PageContainer";

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
      <PageContainer title={`Send offer to ${selectedClient.full_name}`}>
        <Form onSubmit={onSubmit}>
          <p>
            {selectedClient.full_name} will receive an email with the link to
            subscribe and pay your specified amount monthly.
          </p>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
          <Button
            type="submit"
            disabled={isNaN(parseFloat(monthlyAmount as any))}
            submittingText="Sending..."
            error={error || ""}
          >
            Send Offer
          </Button>
        </Form>
      </PageContainer>
    </Modal>
  );
};

export default OfferModal;
