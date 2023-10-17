import { UUID } from "crypto";
import React, { useEffect, useState } from "react";

interface ActionFormProps {
  action: string;
  itemId?: UUID;
}

const ActionForm: React.FC<ActionFormProps> = ({ action }) => {
  const [actionConfig, setActionConfig] = useState<any>(null);

  useEffect(() => {
    const loadActionConfig = async () => {
      try {
        const actionParts = action.split(".");
        const actionName = actionParts.pop();
        const domainPath = actionParts.join("/domains/");

        const { default: actionModule } = await import(
          `@/domains/${domainPath}/actions/${actionName}`
        );
        setActionConfig(actionModule);
      } catch (error) {
        console.error("Could not load action config:", error);
      }
    };

    loadActionConfig();
  }, [action]);

  if (!actionConfig) {
    return <div>Loading...</div>;
  }

  const EnhancedForm = actionConfig.formHoc(actionConfig.Form);
  return <EnhancedForm />;
};

export default ActionForm;
