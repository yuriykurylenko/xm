import styles from "@/app/components/clients/ClientCard/styles.module.css";
import BasicButton from "@/app/components/BasicButton";
import { Client } from "@/app/types/user";
import { ReactNode, useState } from "react";

interface ClientCardProps {
  client: Client;
  onActionButtonClick: (client: Client) => void;
  actionButtonText: string | ReactNode;
  selectedClients: Client[];
  onClientSelect: () => void;
  bulkOperationsAllowed: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onActionButtonClick,
  actionButtonText,
  selectedClients,
  onClientSelect,
  bulkOperationsAllowed = false,
}) => {
  const [selected, setSelected] = useState(false);

  const handleCheckboxChange = () => {
    setSelected(!selected);
    onClientSelect();
  };

  return (
    <div className={styles["card-row"]}>
      {bulkOperationsAllowed && (
        <div className={`${styles["bulk-column"]} ${styles["column"]}`}>
          <input
            type="checkbox"
            checked={selectedClients.map((c) => c.id).includes(client.id)}
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
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, "/")}
      </div>
      <div className={styles["column"]}>
        {client.status === "lead" && (
          <div className={styles["button-container"]}>
            <BasicButton
              className={styles["action-btn"]}
              onClick={() => onActionButtonClick(client)}
            >
              {actionButtonText}
            </BasicButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
