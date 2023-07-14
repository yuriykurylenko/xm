import React from "react";
import Modal from "react-modal";
import styles from "@/app/components/ConfirmationDialog/styles.module.css";
import BasicButton from "../BasicButton";

export type ConfirmationDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  selectedItems: any[];
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onConfirm,
  onCancel,
  selectedItems,
}) => {
  return (
    <Modal
      isOpen={true}
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
