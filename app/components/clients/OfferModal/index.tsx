import Modal from "react-modal";
import { useState } from "react";
import { sendClientOffer } from "@/app/utils/api";

import Form from "@/app/components/Form";
import PriceInput from "@/app/components/Form/PriceInput";
import Button from "@/app/components/Form/Button";
import PageContainer from "@/app/components/PageContainer";
import { Client, Coach } from "@/app/types/user";

Modal.setAppElement("#__next");

interface OfferModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedClient: Client;
  user: Coach;
  onOfferSent?: () => void;
}

interface OfferModalFormData {
  monthlyAmount: number | string;
}

const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  closeModal,
  selectedClient,
  user,
  onOfferSent,
}) => {
  const [, setMonthlyAmount] = useState(user.monthly_subscription_amount / 100);
  async function onModalClose() {
    closeModal();
    setMonthlyAmount(user.monthly_subscription_amount / 100);
  }

  async function onSubmit(data: OfferModalFormData) {
    const { monthlyAmount } = data;
    const { data: sendOfferData, error } = await sendClientOffer(
      selectedClient.id,
      {
        monthlyAmount: Number(monthlyAmount) * 100,
        currency: "USD",
      }
    );

    if (error) {
      return { data: sendOfferData, error };
    }

    onModalClose();
    onOfferSent && onOfferSent();

    return { data: sendOfferData, error };
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
          <Button type="submit" submittingText="Sending...">
            Send Offer
          </Button>
        </Form>
      </PageContainer>
    </Modal>
  );
};

export default OfferModal;
