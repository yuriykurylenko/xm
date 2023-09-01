import React from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/ItemList/ActionsBar/styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";

interface Action<T> {
  name: string;
  title: string;
  titleBulk: string;
  icon: IconDefinition;
  handler: (itemIds: UUID[]) => void;
  show: (item: T | T[]) => boolean;
}

interface ActionsBarProps<T> {
  actions: Action<T>[];
  selectedItems: T[];
  showTitles?: boolean;
}

const ActionsBar = <T extends { id: UUID }>({
  actions,
  selectedItems,
  showTitles = false,
}: ActionsBarProps<T>) => {
  return (
    <div
      className={`${styles["action-buttons-container"]} ${
        showTitles ? styles["action-buttons-container-full"] : ""
      }`}
    >
      {actions.map(
        (action, index) =>
          selectedItems.every((item) => action.show(item)) && (
            <span
              title={
                selectedItems.length === 1 ? action.title : action.titleBulk
              }
              key={index}
            >
              <BasicButton
                className={`${styles["action-btn"]} ${
                  styles["action-btn-" + action.name]
                } `}
                onClick={() =>
                  action.handler(selectedItems.map((item) => item.id))
                }
              >
                <FontAwesomeIcon
                  icon={action.icon}
                  className={styles["action-btn-icon"]}
                />
                {showTitles ? action.titleBulk : null}
              </BasicButton>
            </span>
          )
      )}
    </div>
  );
};

export default ActionsBar;
