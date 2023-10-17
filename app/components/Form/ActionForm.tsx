import { UUID } from "crypto";
import React, { useEffect, useState } from "react";
import Form from "@/app/components/Form";
import Button from "@/app/components/Form/Button";

interface ActionFormProps {
  action: string;
  itemId?: UUID;
}

const ActionForm: React.FC<ActionFormProps> = ({ action, itemId }) => {
  const [actionConfig, setActionConfig] = useState<any>(null);
  const [item, setItem] = useState<any>(null);

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

        const { fetch } = await import(`@/domains/${domainPath}/model`);
        const { data: item } = await fetch(itemId);
        setItem(item);
      } catch (error) {
        console.error("Could not load action config:", error);
      }
    };

    loadActionConfig();
  }, [action]);

  if (!actionConfig) {
    return <div>Loading...</div>;
  }

  const CustomForm = (context: any) => {
    return (
      <Form onSubmit={() => actionConfig.handler(item.id, context)}>
        <actionConfig.Form />
        <Button type="submit" submittingText={actionConfig.submittingText}>
          {actionConfig.title}
        </Button>
      </Form>
    );
  };

  const EnhancedForm = actionConfig.formHoc(CustomForm);
  return <EnhancedForm />;
};

export default ActionForm;
