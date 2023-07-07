import React from "react";
import styles from "@/app/components/clients/ClientsListHeader/styles.module.css";
import ActionsBar from "../ActionsBar";
import { Client } from "@/app/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";

interface ClientsListHeaderProps {
  onBulkSelect: () => void;
  selectedClients: Client[];
  actions: any;
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

const ClientsListHeader: React.FC<ClientsListHeaderProps> = ({
  onBulkSelect,
  selectedClients = [],
  actions,
  onSort,
  sortColumn,
  sortDirection,
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
            className={`${styles["header-column"]} ${styles["header-column-name"]} ${styles["header-column-sortable"]}`}
            onClick={() => onSort("full_name")}
          >
            <span>Name</span>
            <span className={styles["sorting-icon"]}>
              {sortColumn === "full_name" ? (
                <FontAwesomeIcon
                  icon={sortDirection === "asc" ? faSortUp : faSortDown}
                  size="sm"
                />
              ) : (
                <FontAwesomeIcon icon={faSort} size="sm" color="#aaa" />
              )}
            </span>
          </div>
          <div
            className={`${styles["header-column"]} ${styles["header-column-created"]} ${styles["header-column-sortable"]}`}
            onClick={() => onSort("created_at")}
          >
            <span>Created</span>
            <span className={styles["sorting-icon"]}>
              {sortColumn === "created_at" ? (
                <FontAwesomeIcon
                  icon={sortDirection === "asc" ? faSortUp : faSortDown}
                  size="sm"
                />
              ) : (
                <FontAwesomeIcon icon={faSort} size="sm" color="#aaa" />
              )}
            </span>
          </div>
          <div className={styles["header-column"]}>Actions</div>
        </>
      )}
    </div>
  );
};

export default ClientsListHeader;
