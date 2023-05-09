import { useEffect, useState } from "react";
import styles from "@/app/styles/clientsList.module.css";
import supabase from "@/app/utils/supabaseClient";

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const coachId = "af5fd20b-6468-465a-b5ec-c50d7dbcea7a";

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("coach_id", coachId);

    if (error) {
      console.error("Error fetching clients:", error);
    } else {
      setClients(data);
    }
  }

  const filteredClients = clients.filter((client) => {
    if (filterStatus === "all") {
      return true;
    }
    return (client as any).status === filterStatus;
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
          <div key={(client as any).id} className={styles["client-item"]}>
            <div className={styles["avatar"]}>
              {(client as any).full_name.charAt(0)}
            </div>
            <div className={styles["client-name"]}>
              {(client as any).full_name}
            </div>
            {(client as any).status === "lead" && (
              <button className={styles.btn}>Send Offer</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ClientsList;
