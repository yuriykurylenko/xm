import React from "react";
import styles from "@/app/components/clients/ClientsListHeader/styles.module.css";

interface ClientsListHeaderProps {
  onBulkSelect: () => void;
  isBulkSelected: boolean;
}

const ClientsListHeader: React.FC<ClientsListHeaderProps> = ({
  onBulkSelect,
  isBulkSelected,
}) => {
  const handleBulkSelectChange = () => {
    onBulkSelect();
  };

  return (
    <div className={styles["header-row"]}>
      <div
        className={`${styles["header-column"]} ${styles["header-column-bulk"]}`}
      >
        <input
          type="checkbox"
          checked={isBulkSelected}
          onChange={handleBulkSelectChange}
        />
      </div>
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
    </div>
  );
};

export default ClientsListHeader;
