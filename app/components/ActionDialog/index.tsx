import * as React from "react";
import Modal from "react-modal";

import Form from "@/app/components/Form";
import PageContainer from "@/app/components/PageContainer";
import BasicButton from "@/app/components/BasicButton";
import Button from "@/app/components/Form/Button";

import styles from "@/app/components/ActionDialog/styles.module.css";

Modal.setAppElement("#__next");

export interface ActionDialogProps {
  onConfirm: (data: any) => Promise<any>;
  onCancel: () => void;
  children?: React.ReactNode;
  title: string;
  text?: string;
  infoText?: string;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  onConfirm,
  onCancel,
  children,
  title,
  text,
  infoText,
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
        {text && <p>{text}</p>}
        {infoText && <p className={styles["dialog-text"]}>{infoText}</p>}
        <Form onSubmit={onConfirm}>
          <div className={styles["dialog-form-content"]}>{children}</div>
          <div className={styles["buttons-container"]}>
            <div className={styles["button-container"]}>
              <BasicButton className={styles["cancel-btn"]} onClick={onCancel}>
                Cancel
              </BasicButton>
            </div>
            <div className={styles["button-container"]}>
              <Button type="submit">Confirm</Button>
            </div>
          </div>
        </Form>
      </PageContainer>
    </Modal>
  );
};

export default ActionDialog;
