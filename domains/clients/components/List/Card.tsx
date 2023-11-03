import styles from "@/domains/clients/components/List/styles.module.css";
import { Client, Coach } from "@/types/user";
import { useState } from "react";
import ActionsColumn from "@/app/components/ActionsColumn";
import {
  faCreditCard,
  faHandHoldingDollar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatAmount } from "@/app/utils/currency";
import { formatDate } from "@/app/utils/dateTime";

interface ClientCardProps {
  item: Client;
  selectedItems: Client[];
  onSelect: () => void;
  bulkOperationsAllowed: boolean;
  actions?: any;
  user?: Coach;
}

const ClientCard: React.FC<ClientCardProps> = ({
  item,
  selectedItems,
  onSelect,
  bulkOperationsAllowed = false,
  actions,
  user,
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
        <div className={`${styles["column-bulk"]}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
          />
        </div>
      )}
      <div className={`${styles["column-avatar"]}`}>
        <span className={`${styles["avatar"]}`}>
          {item.full_name
            .split(" ")
            .map((n) => n.charAt(0))
            .join("")}
        </span>
      </div>
      <div className={`${styles["column-full_name"]}`}>{item.full_name}</div>
      <div className={`${styles["column"]}`}>
        {item.status !== "lead" &&
          (item.start_date && new Date(item.start_date) > new Date() ? (
            <div>
              {formatDate(item.start_date)}{" "}
              {item.subscription?.trial_period_days ? (
                <FontAwesomeIcon
                  icon={faHandHoldingDollar}
                  size="lg"
                  color="#7c9efc"
                  title="14-day free trial period"
                />
              ) : (
                ""
              )}
            </div>
          ) : item.start_date && new Date(item.start_date) <= new Date() ? (
            <div
              className={
                item.status === "offerSent" ? styles["error-text"] : ""
              }
              title={
                item.status === "offerSent"
                  ? "The client will start upon upon providing payment details"
                  : ""
              }
            >
              {formatDate(item.start_date)}{" "}
              {item.status === "offerSent" && (
                <FontAwesomeIcon
                  icon={faCreditCard}
                  size="lg"
                  color="#ff7f7f"
                />
              )}
            </div>
          ) : (
            item.status === "offerSent" && (
              <>
                <FontAwesomeIcon
                  icon={faCreditCard}
                  size="lg"
                  color="#7c9efc"
                  title="The client will start upon providing payment details"
                />{" "}
                {item.subscription?.trial_period_days ? (
                  <FontAwesomeIcon
                    icon={faHandHoldingDollar}
                    size="lg"
                    color="#7c9efc"
                    title="14-day free trial period"
                  />
                ) : (
                  ""
                )}
              </>
            )
          ))}
      </div>
      <div className={`${styles["column"]}`}>
        {item.end_date && formatDate(item.end_date)}
      </div>
      <div className={`${styles["column"]}`}>
        {item.subscription &&
          `${formatAmount(
            item.subscription.monthly_amount,
            item.subscription.currency
          )}/mo`}
      </div>
      <div className={`${styles["column"]}`}>
        <div
          className={`${styles["label"]} ${
            styles["label-" + item.subscription_status]
          }`}
        >
          {item.subscription_status === "active"
            ? "paid"
            : item.subscription_status}
        </div>
      </div>
      <div className={`${styles["column"]}`}>
        <div
          className={`${styles["label"]} ${
            styles[
              "label-" +
                (item.user_id && !item.access_revoked_at
                  ? "active"
                  : "inactive")
            ]
          }`}
        >
          {item.user_id && !item.access_revoked_at ? "active" : "inactive"}
        </div>
      </div>
      <div className={`${styles["column-actions"]}`}>
        <ActionsColumn<Client>
          actions={actions}
          domain="clients"
          selectedItems={[item]}
          context={{
            monthly_amount: user?.monthly_subscription_amount,
            trial_period: false,
          }}
        />
      </div>
    </div>
  );
};

export default ClientCard;
