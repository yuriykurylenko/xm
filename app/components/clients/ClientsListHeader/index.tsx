import React from "react";
import styles from "@/app/components/clients/ClientsListHeader/styles.module.css";
import ActionsBar from "../ActionsBar";
import { Client } from "@/app/types/user";

interface ClientsListHeaderProps {
  onBulkSelect: () => void;
  selectedClients: Client[];
  actions: any;
}

const ClientsListHeader: React.FC<ClientsListHeaderProps> = ({
  onBulkSelect,
  selectedClients = [],
  actions,
}) => {
  const handleBulkSelectChange = () => {
    onBulkSelect();
  };

  const isBulkSelected = selectedClients.length > 0;

  return (
    <div
      className={`${styles["header-row"]} ${
        isBulkSelected ? styles["header-row-no-padding"] : ""
      }`}
    >
      <div
        className={`${styles["header-column"]} ${styles["header-column-bulk"]}`}
      >
        <input
          type="checkbox"
          checked={isBulkSelected}
          onChange={handleBulkSelectChange}
        />
      </div>
      {isBulkSelected ? (
        <>
          <div
            className={`${styles["header-column"]} ${styles["header-column-selected"]}`}
          >
            {`${selectedClients.length} selected`}
          </div>
          <div className={styles["header-column"]}>
            <ActionsBar actions={actions} selectedClients={selectedClients} />
          </div>
        </>
      ) : (
        <>
          <div
            className={`${styles["header-column"]} ${styles["header-column-avatar"]}`}
          >
            &nbsp;
          </div>
          <div
            className={`${styles["header-column"]} ${styles["header-column-name"]}`}
          >
            Name
          </div>
          <div
            className={`${styles["header-column"]} ${styles["header-column-created"]}`}
          >
            Created
          </div>
          <div className={styles["header-column"]}>Actions</div>
        </>
      )}
    </div>
  );
};

export default ClientsListHeader;
