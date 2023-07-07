import React from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/clients/ActionsBar/styles.module.css";
import { Client } from "@/app/types/user";

interface Action {
  name: string;
  title: string;
  titleBulk: string;
  icon: React.ReactNode;
  handler: (clients: Client[]) => void;
  show: boolean;
}

interface ActionsBarProps {
  actions: Action[];
  selectedClients: Client[];
}

const ActionsBar: React.FC<ActionsBarProps> = ({
  actions,
  selectedClients,
}) => {
  return (
    <div className={styles["action-buttons-container"]}>
      {actions.map(
        (action, index) =>
          action.show && (
            <span
              title={
                selectedClients.length === 1 ? action.title : action.titleBulk
              }
              key={index}
            >
              <BasicButton
                className={`${styles["action-btn"]} ${
                  styles["action-btn-" + action.name]
                } `}
                onClick={() => action.handler(selectedClients)}
              >
                {action.icon}
              </BasicButton>
            </span>
          )
      )}
    </div>
  );
};

export default ActionsBar;
