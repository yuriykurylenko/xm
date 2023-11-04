import * as React from "react";
import Modal from "react-modal";

import Form from "@/app/components/Form";
import PageContainer from "@/app/components/PageContainer";
import BasicButton from "@/app/components/BasicButton";
import Button from "@/app/components/Form/Button";

import styles from "@/app/components/Actions/Dialog/styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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
          margin: "auto",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
          padding: "0 20px",
        },
      }}
    >
      <button
        onClick={onCancel}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "1.5em",
          cursor: "pointer",
          color: "#aaa",
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <PageContainer title={title} fullHeight={false}>
        <div>{text && <p className={styles["dialog-text"]}>{text}</p>}</div>
        <div className={styles["dialog-form"]}>
          <Form onSubmit={onConfirm}>
            <div>{children}</div>
            {infoText && (
              <p className={styles["dialog-info-text"]}>{infoText}</p>
            )}
            <div className={styles["buttons-container"]}>
              <div className={styles["button-container"]}>
                <BasicButton
                  className={styles["cancel-btn"]}
                  onClick={onCancel}
                >
                  Cancel
                </BasicButton>
              </div>
              <div className={styles["button-container"]}>
                <Button type="submit">Confirm</Button>
              </div>
            </div>
          </Form>
        </div>
      </PageContainer>
    </Modal>
  );
};

export default ActionDialog;
