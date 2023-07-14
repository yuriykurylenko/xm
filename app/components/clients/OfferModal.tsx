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
  title: string;
  text: string;
}

interface OfferModalFormData {
  monthlyAmount: number | string;
}

const OfferModal: React.FC<OfferModalProps> = ({
  selectedItems,
  onConfirm,
  onCancel,
  children,
  title,
  text,
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
      <PageContainer title={title}>
        <p>{text}</p>
        <Form<OfferModalFormData> onSubmit={onConfirm}>{children}</Form>
      </PageContainer>
    </Modal>
  );
};

export default OfferModal;
