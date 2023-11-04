import React from "react";
import styles from "@/domains/clients/components/List/styles.module.css";
import ActionsBar from "@/app/components/Actions/Bar";
import { Client } from "@/types/user";
import SortIcon from "@/app/components/SortIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as icons from "@fortawesome/free-solid-svg-icons";

interface ClientsListHeaderProps {
  onBulkSelect: () => void;
  selectedItems: Client[];
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  actions: any;
  totalItemsCount: number;
  user?: any;
}

const ClientsListHeader: React.FC<ClientsListHeaderProps> = ({
  onBulkSelect,
  selectedItems = [],
  onSort,
  sortColumn,
  sortDirection,
  actions,
  totalItemsCount,
  user,
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
      <div className={`${styles["column-bulk"]}`}>
        <input
          type="checkbox"
          checked={isBulkSelected}
          onChange={handleBulkSelectChange}
        />
      </div>
      {isBulkSelected ? (
        <>
          <div>
            <ActionsBar<Client>
              domain="clients"
              actions={actions}
              selectedItems={selectedItems}
              showTitles
              context={{
                monthly_amount: user?.monthly_subscription_amount,
                trial_period: false,
              }}
            />
          </div>
          <div className={`${styles["column-selected"]}`}>
            {`${selectedItems.length} / ${totalItemsCount} selected`}
          </div>
        </>
      ) : (
        <>
          <div className={`${styles["column-avatar"]}`}>&nbsp;</div>
          <div
            className={`${styles["column-full_name"]} ${styles["column-sortable"]}`}
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
            className={`${styles["column"]} ${styles["column-sortable"]}`}
            onClick={() => onSort("start_date")}
          >
            <span>Start date</span>
            <span className={styles["sorting-icon"]}>
              <SortIcon
                sortColumn={sortColumn}
                column="start_date"
                sortDirection={sortDirection}
              />
            </span>
          </div>
          <div
            className={`${styles["column"]} ${styles["column-sortable"]}`}
            onClick={() => onSort("end_date")}
          >
            <span>End date</span>
            <span className={styles["sorting-icon"]}>
              <SortIcon
                sortColumn={sortColumn}
                column="end_date"
                sortDirection={sortDirection}
              />
            </span>
          </div>
          <div className={`${styles["column"]} ${styles["column-sortable"]}`}>
            <span>Price</span>
          </div>
          <div
            className={`${styles["column"]} ${styles["column-sortable"]}`}
            onClick={() => onSort("subscription_status")}
          >
            <span>Payment</span>
            <span className={styles["sorting-icon"]}>
              <SortIcon
                sortColumn={sortColumn}
                column="subscription_status"
                sortDirection={sortDirection}
              />
            </span>
          </div>
          <div className={`${styles["column"]} ${styles["column-sortable"]}`}>
            <span>Account</span>
          </div>
          <div className={`${styles["column-actions"]}`}>
            <FontAwesomeIcon icon={icons.faSlidersH} />
          </div>
        </>
      )}
    </div>
  );
};

export default ClientsListHeader;
