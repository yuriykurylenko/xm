import * as React from "react";
import Modal from "react-modal";

import Form from "@/app/components/Form";
import PageContainer from "@/app/components/PageContainer";
import { Client, Coach } from "@/app/types/user";

Modal.setAppElement("#__next");

export interface OfferModalProps {
  selectedItems: Client[];
  onConfirm: (data: { monthlyAmount: number | string }) => Promise<any>;
  onCancel: () => Promise<any>;
  children?: React.ReactNode;
}

interface OfferModalFormData {
  monthlyAmount: number | string;
}

const OfferModal: React.FC<OfferModalProps> = ({
  selectedItems,
  onConfirm,
  onCancel,
  children,
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
        <p>
          {selectedItems.length === 1
            ? selectedItems[0].full_name
            : "Your clients"}{" "}
          will receive an email with the link to subscribe and pay your
          specified amount monthly.
        </p>
        <Form<OfferModalFormData> onSubmit={onConfirm}>{children}</Form>
      </PageContainer>
    </Modal>
  );
};

export default OfferModal;
