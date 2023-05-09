import { useState } from "react";
import styles from "@/app/styles/clientsList.module.css";

const ClientsList = () => {
  const clients = [
    { id: 1, name: "John Doe", status: "lead" },
    { id: 2, name: "Jane Smith", status: "client" },
    { id: 3, name: "Bill Johnson", status: "lead" },
  ];

  const [filterStatus, setFilterStatus] = useState("all");

  const filteredClients = clients.filter((client) => {
    if (filterStatus === "all") {
      return true;
    }
    return client.status === filterStatus;
  });

  return (
    <>
      <div className={styles["clients-container-header"]}>
        <h1>Clients</h1>
        <div>
          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "all" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "lead" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("lead")}
          >
            Leads
          </button>
          <button
            className={`${styles["filter-btn"]} ${
              filterStatus === "client" && styles["filter-btn-active"]
            }`}
            onClick={() => setFilterStatus("client")}
          >
            Clients
          </button>
        </div>
      </div>
      <div className={styles["clients-container"]}>
        {filteredClients.map((client) => (
          <div key={client.id} className={styles["client-item"]}>
            <div className={styles["avatar"]}>{client.name.charAt(0)}</div>
            <div className={styles["client-name"]}>{client.name}</div>
            {client.status === "lead" && (
              <button className={styles.btn}>Send Offer</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ClientsList;
