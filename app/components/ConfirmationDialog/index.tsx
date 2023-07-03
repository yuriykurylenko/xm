import React from "react";
import Modal from "react-modal";
import styles from "@/app/components/ConfirmationDialog/styles.module.css";
import BasicButton from "../BasicButton";

type ConfirmationDialogProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      className={styles["confirmation-dialog-container"]}
      overlayClassName={styles["confirmation-dialog-overlay"]}
    >
      <div className={styles["confirmation-dialog-box"]}>
        <h2 className={styles["confirmation-dialog-message"]}>{message}</h2>
        <div className={styles["confirmation-dialog-buttons"]}>
          <BasicButton onClick={onCancel} className={styles["cancel-button"]}>
            Cancel
          </BasicButton>
          <BasicButton onClick={onConfirm} className={styles["confirm-button"]}>
            Confirm
          </BasicButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
