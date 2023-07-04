import styles from "@/app/components/clients/ClientCard/styles.module.css";
import BasicButton from "@/app/components/BasicButton";
import { Client } from "@/app/types/user";
import { useState } from "react";

interface ClientCardProps {
  client: Client;
  onActionButtonClick: (client: Client) => void;
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
      <div className={`${styles["column"]} ${styles["button-container"]}`}>
        {actions.map(
          (action: any, i: number) =>
            action.show && (
              <span title={action.title} key={i}>
                <BasicButton
                  className={styles["action-btn"]}
                  onClick={() => action.handler(client)}
                >
                  {action.icon}
                </BasicButton>
              </span>
            )
        )}
      </div>
    </div>
  );
};

export default ClientCard;
