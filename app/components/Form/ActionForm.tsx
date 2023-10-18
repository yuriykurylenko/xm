import React, { useEffect, useState } from "react";
import Form from "@/app/components/Form";
import Button from "@/app/components/Form/Button";
import { UUID } from "crypto";
import { fetchYaml } from "@/app/utils/fetchYaml";
import Input from "@/app/components/Form/Input";

interface ActionFormProps {
  action: string;
  itemId?: UUID;
}

const ActionForm: React.FC<ActionFormProps> = ({ action, itemId }) => {
  const [item, setItem] = useState<any>(null);
  const [actionConfig, setActionConfig] = useState<any>(null);
  const [formHocModule, setFormHocModule] = useState<any>(null);
  const [formHocName, setFormHocName] = useState<string>("");
  const [actionModule, setActionModule] = useState<any>(null);

  const actionParts = action.split(".");
  const actionName = actionParts.pop();
  const domainPath = actionParts.join("/domains/");

  useEffect(() => {
    const fetchItem = async () => {
      const actionsConfig = await fetchYaml(
        `/api/actions?domainPath=${domainPath}`
      );

      // @ts-ignore
      const config = actionsConfig[actionName];
      setActionConfig(config);

      const hocName = config?.form.hoc;
      setFormHocName(hocName);

      const hocModule = await import(`@/app/hoc/${hocName}`);
      setFormHocModule(hocModule);

      const actionModule = await import(
        `@/domains/${domainPath}/actions/${actionName}`
      );
      setActionModule(actionModule);

      try {
        const { fetch } = await import(`@/domains/${domainPath}/model`);
        const { data: item } = await fetch(itemId);
        setItem(item);
      } catch (error) {
        console.error("Could not load item:", error);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId, domainPath]);

  const CustomForm = (context: any) => {
    const handler = async () => {
      try {
        const { error } = await actionModule.handler(item?.id, context);
        if (!error) {
          item && (await actionModule.onComplete(item));
        }
        return { data: item, error };
      } catch (error) {
        return { data: item, error };
      }
    };

    return actionConfig ? (
      <Form onSubmit={handler}>
        {actionConfig.form.inputs.map((input: any, index: number) => (
          <Input key={index} {...input} />
        ))}
        <Button type="submit" submittingText={actionConfig.submittingText}>
          {actionConfig.title}
        </Button>
      </Form>
    ) : (
      <></>
    );
  };

  const EnhancedForm = formHocModule
    ? formHocModule[formHocName](CustomForm)
    : () => <></>;

  return <EnhancedForm />;
};

export default ActionForm;
