import styles from "@/app/components/clients/ClientCard/styles.module.css";
import { Client } from "@/app/types/user";
import { useState } from "react";
import ActionsBar from "../ActionsBar";

interface ClientCardProps {
  item: Client;
  selectedItems: Client[];
  onSelect: () => void;
  bulkOperationsAllowed: boolean;
  actions?: any;
  filterStatus: string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  item,
  selectedItems,
  onSelect,
  bulkOperationsAllowed = false,
  actions,
  filterStatus,
}) => {
  const [selected, setSelected] = useState(false);

  const handleCheckboxChange = () => {
    setSelected(!selected);
    onSelect();
  };

  const isSelected = selectedItems.map((c) => c.id).includes(item.id);

  return (
    <div
      className={`${styles["card-row"]} ${
        isSelected ? styles["card-row-selected"] : ""
      }`}
    >
      {bulkOperationsAllowed && (
        <div className={`${styles["bulk-column"]} ${styles["column"]}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
          />
        </div>
      )}
      <div className={`${styles["avatar"]} ${styles["column"]}`}>
        {item.full_name.charAt(0)}
      </div>
      <div
        className={`${styles["item-name"]} ${styles["name-column"]} ${styles["column"]}`}
      >
        {item.full_name}
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        {new Date(item.created_at as Date)
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .replace(/\//g, "/")}
      </div>
      <div
        className={`${styles["column"]} ${styles["actions-column"]} ${styles["button-container"]}`}
      >
        <ActionsBar
          actions={actions}
          selectedClients={[item]}
          filterStatus={filterStatus}
        />
      </div>
    </div>
  );
};

export default ClientCard;
