import ClientCard from "@/app/components/clients/ClientList/ClientCard";
import styles from "@/app/components/clients/ClientList/styles.module.css";

interface ClientListProps {
  user: any;
  clients: any[];
  onSendOfferClick: (client: any) => void;
}

const ClientList: React.FC<ClientListProps> = ({
  user,
  clients,
  onSendOfferClick,
}) => {
  return (
    <div className={styles["clients-container"]}>
      {clients.length > 0
        ? clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSendOfferClick={() => onSendOfferClick(client)}
            />
          ))
        : user && (
            <div className={styles["no-clients-container"]}>
              Please share this link to get your clients to apply for coaching:
              <br />
              <a
                href={`${window.location.protocol}//${window.location.host}/${
                  (user as any).slug
                }/apply`}
              >
                {`${window.location.protocol}//${window.location.host}/${
                  (user as any).slug
                }/apply`}
              </a>
            </div>
          )}
    </div>
  );
};

export default ClientList;
