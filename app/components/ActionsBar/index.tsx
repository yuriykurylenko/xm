import React, { useEffect, useState } from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/ActionsBar/styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UUID } from "crypto";
import ActionDialog from "@/app/components/ActionDialog";
import axios from "axios";
import Handlebars from "handlebars";

import * as icons from "@fortawesome/free-solid-svg-icons";
import ActionDialogForm from "@/app/components/Form/ActionDialogForm";
import useConfig from "@/app/hooks/useConfig";

interface Action<T> {
  name: string;
  title: string;
  titleBulk: string;
  icon: string;
  handler: (itemIds: UUID[]) => void;
  onClick: (itemIds: UUID[]) => void;
  show: (item: T | T[]) => boolean;
}

interface ActionsBarProps<T> {
  actions: string[];
  selectedItems: T[];
  showTitles?: boolean;
  context?: any;
}

const ActionsBar = <T extends { id: UUID }>({
  actions,
  selectedItems,
  showTitles = false,
  context,
}: ActionsBarProps<T>) => {
  const [actionDefinitions, setActionDefinitions] = useState<Action<T>[]>([]);
  const [openActionDialogs, setOpenActionDialogs] = useState<string[]>([]);

  // @ts-ignore
  const config = useConfig();

  useEffect(() => {
    const loadActions = async () => {
      try {
        const actionBreakdowns = actions.map((action) => {
          const actionParts = action.split(".");
          const actionName = actionParts.pop();
          const domainPath = actionParts.join("/domains/");

          return { domainPath, actionName };
        });

        const actionConfigs = (
          await Promise.all(
            actionBreakdowns.map(async ({ domainPath, actionName }) => ({
              config: config?.actions?.[`${domainPath}.${actionName}`],
              domainPath,
              path: `${domainPath}.${actionName}`,
              name: actionName,
              module: await import(
                `@/domains/${domainPath}/actions/${actionName}`
              ),
            }))
          )
        )
          .map(({ name, domainPath, path, config, module }) => ({
            domainPath,
            path,
            name,
            ...config,
            handler: module.handler,
            show: module.show,
            onComplete: module.onComplete,
          }))
          .filter((actionConfig) => actions.includes(actionConfig.path));

        setActionDefinitions(
          actionConfigs.map((action: Action<T>) => ({
            ...action,
            onClick: () => setOpenActionDialogs([action.name as string]),
          }))
        );
      } catch (error) {
        console.error("Error loading modules:", error);
      }
    };

    if (config?.actions) {
      loadActions();
    }
  }, [actions, config]);

  const handleCloseDialog = () => {
    setOpenActionDialogs([]);
  };

  const handleConfirmAction = async (action: any, data?: any) => {
    let updatedItem;
    for (const item of selectedItems) {
      try {
        const { data: newItem, error } = !action.useApi
          ? await action.handler(item.id, data)
          : await axios.put(
              `/api/${action.domainPath}/${item.id}/${action.name}`,
              data
            );

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
    action.onComplete && action.onComplete(updatedItem);

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
                  : action.titleBulk || action.title
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
                  //@ts-ignore
                  icon={icons[action.icon]}
                  className={styles["action-btn-icon"]}
                />
                {showTitles ? action.titleBulk || action.title : null}
              </BasicButton>
            </span>
          )
      )}
      {actionDefinitions.map((action: any) => {
        const dialogTitleTemplate = Handlebars.compile(action.dialog.title);
        const dialogTitleBulkTemplate = Handlebars.compile(
          action.dialog.titleBulk
        );
        const dialogTextTemplate = Handlebars.compile(action.dialog.text || "");
        const dialogTextBulkTemplate = Handlebars.compile(
          action.dialog.textBulk || ""
        );
        const dialogInfoTextTemplate = Handlebars.compile(
          action.dialog.infoText || ""
        );
        const dialogInfoTextBulkTemplate = Handlebars.compile(
          action.dialog.infoTextBulk || ""
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
              {action.dialog.form && (
                <ActionDialogForm
                  actionConfig={action}
                  items={selectedItems}
                  values={context}
                />
              )}
            </ActionDialog>
          )
        );
      })}
    </div>
  );
};

export default ActionsBar;
