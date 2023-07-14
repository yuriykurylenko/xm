import React from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/ActionsBar/styles.module.css";

interface Action<T> {
  name: string;
  title: string;
  titleBulk: string;
  icon: React.ReactNode;
  handler: (items: T[]) => void;
  show: (item: T | T[]) => boolean;
}

interface ActionsBarProps<T> {
  actions: Action<T>[];
  selectedItems: T[];
}

const ActionsBar = <T,>({ actions, selectedItems }: ActionsBarProps<T>) => {
  return (
    <div className={styles["action-buttons-container"]}>
      {actions.map(
        (action, index) =>
          action.show(selectedItems) && (
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
                onClick={() => action.handler(selectedItems)}
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
