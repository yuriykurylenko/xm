import React, { useEffect, useState } from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/ActionsBar/styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UUID } from "crypto";
import ActionDialog from "@/app/components/ActionDialog";
import axios from "axios";
import Handlebars from "handlebars";
import pluralize from "pluralize";

import * as icons from "@fortawesome/free-solid-svg-icons";
import ActionDialogForm from "@/app/components/Form/ActionDialogForm";
import useConfig from "@/app/hooks/useConfig";

interface Action<T> {
  name: string;
  path: string;
  domainPath?: string;
  title: string;
  titleBulk: string;
  icon: string;
  handler: (itemIds: UUID[]) => void;
  onClick: (itemIds: UUID[]) => void;
  show: (item: T | T[]) => boolean;
}

interface ActionsBarProps<T> {
  actions: string[];
  domain: string;
  selectedItems: T[];
  showTitles?: boolean;
  context?: any;
}

const ActionsBar = <T extends { id: UUID }>({
  actions,
  domain,
  selectedItems,
  showTitles = false,
  context,
}: ActionsBarProps<T>) => {
  const [actionDefinitions, setActionDefinitions] = useState<Action<T>[]>([]);
  const [openActionDialogs, setOpenActionDialogs] = useState<string[]>([]);

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

        const actionConfigs = await Promise.all(
          actionBreakdowns.map(async ({ domainPath, actionName }) => {
            const configKey = `${domainPath
              .split("/")
              .join(".")
              .replaceAll("domains.", "")}.${actionName}`;

            const actionModule = await import(
              `@/domains/${domainPath}/actions/${actionName}`
            );

            return {
              path: configKey.split(".").slice(0, -1).join("."),
              domainPath,
              name: actionName,
              ...config?.actions?.[configKey],
              show: actionModule.show,
            };
          })
        );

        const showResultsForAllConfigs = await Promise.all(
          actionConfigs.map(async (actionConfig) => {
            const childDomain = actionConfig.path.split(".").pop();
            return Promise.all(
              selectedItems.map(async (item) => {
                return actionConfig.show(
                  domain === childDomain
                    ? item
                    : // @ts-ignore
                      item[pluralize.singular(childDomain)]
                );
              })
            );
          })
        );

        const filteredActionConfigs = actionConfigs.filter(
          (actionConfig, index) =>
            actions.includes(`${actionConfig.path}.${actionConfig.name}`) &&
            showResultsForAllConfigs[index].every(Boolean)
        );

        setActionDefinitions(
          filteredActionConfigs.map((action: Action<T>) => ({
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
      const childDomain = action.path.split(".").pop();
      const id =
        domain === childDomain
          ? item.id
          : // @ts-ignore
            item[pluralize.singular(childDomain)]?.id;

      try {
        const { data: newItem, error } = !action.useApi
          ? await action.handler(id, data)
          : await axios.put(`/api/${action.path}/${id}/${action.name}`, data);

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
      {actionDefinitions.map((action, index) => (
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
            onClick={() => action.onClick(selectedItems.map((item) => item.id))}
          >
            <FontAwesomeIcon
              //@ts-ignore
              icon={icons[action.icon]}
              className={styles["action-btn-icon"]}
            />
            {showTitles ? action.titleBulk || action.title : null}
          </BasicButton>
        </span>
      ))}
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
