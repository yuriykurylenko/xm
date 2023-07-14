import * as React from "react";
import Modal from "react-modal";

import Form from "@/app/components/Form";
import PriceInput from "@/app/components/Form/PriceInput";
import Button from "@/app/components/Form/Button";
import PageContainer from "@/app/components/PageContainer";
import { Client, Coach } from "@/app/types/user";

Modal.setAppElement("#__next");

export interface OfferModalProps {
  selectedItems: Client[];
  user: Coach;
  onConfirm: (data: { monthlyAmount: number | string }) => Promise<any>;
  onCancel: () => Promise<any>;
}

interface OfferModalFormData {
  monthlyAmount: number | string;
}

const OfferModal: React.FC<OfferModalProps> = ({
  selectedItems,
  user,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={true}
      onRequestClose={onCancel}
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
      <PageContainer
        title={`Send offer to ${
          selectedItems.length === 1
            ? selectedItems[0].full_name
            : selectedItems.length + " clients"
        }`}
      >
        <Form<OfferModalFormData> onSubmit={onConfirm}>
          <p>
            {selectedItems.length === 1
              ? selectedItems[0].full_name
              : "Your clients"}{" "}
            will receive an email with the link to subscribe and pay your
            specified amount monthly.
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
