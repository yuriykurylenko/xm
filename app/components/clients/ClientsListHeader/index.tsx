import React from "react";
import styles from "@/app/components/clients/ClientsListHeader/styles.module.css";
import ActionsBar from "../ActionsBar";
import { Client } from "@/app/types/user";
import SortIcon from "@/app/components/SortIcon";

interface ClientsListHeaderProps {
  onBulkSelect: () => void;
  selectedItems: Client[];
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  actions: any;
}

const ClientsListHeader: React.FC<ClientsListHeaderProps> = ({
  onBulkSelect,
  selectedItems = [],
  onSort,
  sortColumn,
  sortDirection,
  actions,
}) => {
  const handleBulkSelectChange = () => {
    onBulkSelect();
  };

  const isBulkSelected = selectedItems.length > 0;

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
            {`${selectedItems.length} selected`}
          </div>
          <div className={styles["header-column"]}>
            <ActionsBar actions={actions} selectedClients={selectedItems} />
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
            className={`${styles["header-column"]} ${styles["header-column-name"]} ${styles["header-column-sortable"]}`}
            onClick={() => onSort("full_name")}
          >
            <span>Name</span>
            <span className={styles["sorting-icon"]}>
              <SortIcon
                sortColumn={sortColumn}
                column="full_name"
                sortDirection={sortDirection}
              />
            </span>
          </div>
          <div
            className={`${styles["header-column"]} ${styles["header-column-created"]} ${styles["header-column-sortable"]}`}
            onClick={() => onSort("created_at")}
          >
            <span>Created</span>
            <span className={styles["sorting-icon"]}>
              <SortIcon
                sortColumn={sortColumn}
                column="created_at"
                sortDirection={sortDirection}
              />
            </span>
          </div>
          <div
            className={`${styles["header-column"]} ${styles["header-column-actions"]}`}
          >
            Actions
          </div>
        </>
      )}
    </div>
  );
};

export default ClientsListHeader;
