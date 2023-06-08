import styles from "@/app/components/ItemList/styles.module.css";

interface ClientCardProps {
  client: any;
  onActionButtonClick: (entity: any) => void;
  actionButtonText: string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onActionButtonClick,
  actionButtonText,
}) => (
  <div className={styles["list-item"]}>
    <div className={styles["avatar"]}>{client.full_name.charAt(0)}</div>
    <div className={styles["item-name"]}>{client.full_name}</div>
    {client.status === "lead" && <button
      className={styles.btn}
      onClick={() => onActionButtonClick(client)}
    >
      {actionButtonText}
    </button>}
    <div className={styles[client.status]}>
    {client.status === "offerSent" && (
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="orange"
          className={styles["icon"]}
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
          />
        </svg>
        Offer sent
      </div>
    )}
    {client.status === "client" && (
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="green"
          className={styles["icon"]}
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Active
      </div>
    )}
    </div>
  </div>
);

export default ClientCard;
