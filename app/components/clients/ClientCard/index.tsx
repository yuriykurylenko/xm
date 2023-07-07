import styles from "@/app/components/clients/ClientCard/styles.module.css";
import { Client } from "@/app/types/user";
import { useState } from "react";
import ActionsBar from "../ActionsBar";

interface ClientCardProps {
  client: Client;
  selectedClients: Client[];
  onClientSelect: () => void;
  bulkOperationsAllowed: boolean;
  actions?: any;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  selectedClients,
  onClientSelect,
  bulkOperationsAllowed = false,
  actions,
}) => {
  const [selected, setSelected] = useState(false);

  const handleCheckboxChange = () => {
    setSelected(!selected);
    onClientSelect();
  };

  const isSelected = selectedClients.map((c) => c.id).includes(client.id);

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
        {client.full_name.charAt(0)}
      </div>
      <div
        className={`${styles["item-name"]} ${styles["name-column"]} ${styles["column"]}`}
      >
        {client.full_name}
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        {new Date(client.created_at as Date)
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .replace(/\//g, "/")}
      </div>
      <div className={`${styles["column"]} ${styles["button-container"]}`}>
        <ActionsBar actions={actions} selectedClients={[client]} />
      </div>
    </div>
  );
};

export default ClientCard;
