import styles from "@/app/components/clients/ClientCard/styles.module.css";
import { Client } from "@/app/types/user";
import { useState } from "react";
import ActionsBar from "@/app/components/ItemList/ActionsBar";
import { format } from "date-fns";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ClientCardProps {
  item: Client;
  selectedItems: Client[];
  onSelect: () => void;
  bulkOperationsAllowed: boolean;
  actions?: any;
}

// Helper function to format the subscription amount
// TODO: abstract out
const formatAmount = (amount: number, currency: string) => {
  const formattedAmount = Number((amount / 100).toFixed(2));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(formattedAmount);
};

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
        {item.start_date && new Date(item.start_date) > new Date() ? (
          format(
            Date.UTC(
              new Date(item.start_date).getFullYear(),
              new Date(item.start_date).getMonth(),
              new Date(item.start_date).getDate()
            ),
            "dd/MM/yyyy"
          )
        ) : item.start_date && new Date(item.start_date) <= new Date() ? (
          <div>
            {format(
              Date.UTC(
                new Date(item.start_date).getFullYear(),
                new Date(item.start_date).getMonth(),
                new Date(item.start_date).getDate()
              ),
              "dd/MM/yyyy"
            )}{" "}
            <FontAwesomeIcon
              icon={faCreditCard}
              size="lg"
              color="#ff7f7f"
              title="The client will start upon confirming the subscription"
            />
          </div>
        ) : (
          <FontAwesomeIcon
            icon={faCreditCard}
            size="lg"
            color="#7c9efc"
            title="The client will start upon confirming the subscription"
          />
        )}
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        {item.end_date &&
          format(
            Date.UTC(
              new Date(item.end_date).getFullYear(),
              new Date(item.end_date).getMonth(),
              new Date(item.end_date).getDate()
            ),
            "dd/MM/yyyy"
          )}
      </div>
      <div className={`${styles["column"]} ${styles["created-column"]}`}>
        {item.subscription &&
          `${formatAmount(
            item.subscription.monthly_amount,
            item.subscription.currency
          )}/mo`}
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
