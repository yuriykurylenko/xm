import React, { useEffect, useState } from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/ItemList/ActionsBar/styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import ActionDialog from "../../ActionDialog";
import axios from "axios";
import Handlebars from "handlebars";

interface Action<T> {
  name: string;
  title: string;
  titleBulk: string;
  icon: IconDefinition;
  handler: (itemIds: UUID[]) => void;
  onClick: (itemIds: UUID[]) => void;
  show: (item: T | T[]) => boolean;
}

interface ActionsBarProps<T> {
  actions: string[];
  selectedItems: T[];
  showTitles?: boolean;
  user?: any;
}

const ActionsBar = <T extends { id: UUID }>({
  actions,
  selectedItems,
  showTitles = false,
  user,
}: ActionsBarProps<T>) => {
  const [actionDefinitions, setActionDefinitions] = useState<Action<T>[]>([]);
  const [openActionDialogs, setOpenActionDialogs] = useState<string[]>([]);

  useEffect(() => {
    const loadActions = async () => {
      try {
        const modules = await Promise.all(
          actions.map(async (action) => {
            const actionParts = action.split(".");
            const actionName = actionParts.pop();
            const domainPath = actionParts.join("/domains/");

            const actionModule = await import(
              `@/domains/${domainPath}/actions/${actionName}`
            );
            return {
              ...actionModule,
              name: actionName,
            };
          })
        );

        setActionDefinitions(
          modules
            .map((module) => ({ name: module.name, ...module.default }))
            .map((action: Action<T>) => ({
              ...action,
              onClick: () => setOpenActionDialogs([action.name as string]),
            }))
        );
      } catch (error) {
        console.error("Error loading modules:", error);
      }
    };

    loadActions();
  }, [actions]);

  const handleCloseDialog = () => {
    setOpenActionDialogs([]);
  };

  const handleConfirmAction = async (action: any, data?: any) => {
    let updatedItem;
    for (const item of selectedItems) {
      try {
        const { data: newItem, error } = action.handler
          ? await action.handler(item.id, data)
          : await axios.put(`/api/clients/${item.id}/${action.name}`, data);

        if (error) {
          return { error };
        }
        updatedItem = newItem;
      } catch (e: any) {
        return (
          e.response?.data || { error: { message: "Something went wrong" } }
        );
      }
    }

    handleCloseDialog();
    action.onComplete && action.onComplete(updatedItem, () => {});

    return { error: null };
  };

  return (
    <div
      className={`${styles["action-buttons-container"]} ${
        showTitles ? styles["action-buttons-container-full"] : ""
      }`}
    >
      {actionDefinitions.map(
        (action, index) =>
          selectedItems.every((item) => action.show(item)) && (
            <span
              title={
                showTitles
                  ? undefined
                  : selectedItems.length === 1
                  ? action.title
                  : action.titleBulk
              }
              key={index}
            >
              <BasicButton
                className={`${styles["action-btn"]} ${
                  styles["action-btn-" + action.name]
                } `}
                onClick={() =>
                  action.onClick(selectedItems.map((item) => item.id))
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
      {actionDefinitions.map((action: any) => {
        const dialogTitleTemplate = Handlebars.compile(action.dialogTitle);
        const dialogTitleBulkTemplate = Handlebars.compile(
          action.dialogTitleBulk
        );
        const dialogTextTemplate = Handlebars.compile(action.dialogText || "");
        const dialogTextBulkTemplate = Handlebars.compile(
          action.dialogTextBulk || ""
        );
        const dialogInfoTextTemplate = Handlebars.compile(
          action.dialogInfoText || ""
        );
        const dialogInfoTextBulkTemplate = Handlebars.compile(
          action.dialogInfoTextBulk || ""
        );

        return (
          openActionDialogs.includes(action.name) && (
            <ActionDialog
              key={action.name}
              onConfirm={(data?: any) => handleConfirmAction(action, data)}
              onCancel={handleCloseDialog}
              title={
                selectedItems.length === 1
                  ? dialogTitleTemplate(selectedItems[0])
                  : dialogTitleBulkTemplate({ n: selectedItems.length })
              }
              text={
                selectedItems.length === 1
                  ? dialogTextTemplate(selectedItems[0])
                  : dialogTextBulkTemplate({
                      n: selectedItems.length,
                    })
              }
              infoText={
                selectedItems.length === 1
                  ? dialogInfoTextTemplate(selectedItems[0])
                  : dialogInfoTextBulkTemplate({
                      n: selectedItems.length,
                    })
              }
            >
              {action.DialogForm && (
                <action.DialogForm items={selectedItems} user={user} />
              )}
            </ActionDialog>
          )
        );
      })}
    </div>
  );
};

export default ActionsBar;
