import styles from "@/app/components/clients/ClientCard/styles.module.css";
import { Client } from "@/app/types/user";
import { useState } from "react";
import ActionsBar from "@/app/components/ItemList/ActionsBar";
import { format } from "date-fns";

interface ClientCardProps {
  item: Client;
  selectedItems: Client[];
  onSelect: () => void;
  bulkOperationsAllowed: boolean;
  actions?: any;
}

const ClientCard: React.FC<ClientCardProps> = ({
  item,
  selectedItems,
  onSelect,
  bulkOperationsAllowed = false,
  actions,
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
        {item.start_date && format(new Date(item.start_date), "dd/MM/yyyy")}
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        {item.end_date && format(new Date(item.end_date), "dd/MM/yyyy")}
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        <div
          className={`${styles["payment-label"]} ${
            styles["payment-label-" + item.subscription_status]
          }`}
        >
          {item.subscription_status === "active"
            ? "paid"
            : item.subscription_status}
        </div>
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        <div
          className={`${styles["payment-label"]} ${
            styles["payment-label-" + (item.user_id ? "active" : "inactive")]
          }`}
        >
          {item.user_id ? "active" : "inactive"}
        </div>
      </div>
      <div
        className={`${styles["column"]} ${styles["actions-column"]} ${styles["button-container"]}`}
      >
        <ActionsBar<Client> actions={actions} selectedItems={[item]} />
      </div>
    </div>
  );
};

export default ClientCard;
