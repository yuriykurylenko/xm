import React, { useEffect, useState } from "react";
import Input from "@/app/components/Form/Input";
import FormSkeleton from "./FormSkeleton";

interface ActionFormProps {
  actionConfig: any;
  items?: any[];
  values?: any;
}

const ActionDialogForm: React.FC<ActionFormProps> = ({
  actionConfig,
  items,
  values,
}) => {
  const [formHocModule, setFormHocModule] = useState<any>(null);
  const [formHocName, setFormHocName] = useState<string>("");

  useEffect(() => {
    const fetchConfig = async () => {
      const hocName = actionConfig?.dialog.form.hoc;

      if (hocName) {
        setFormHocName(hocName);

        const hocModule = await import(`@/app/hoc/${hocName}`);
        setFormHocModule(hocModule);
      }
    };

    fetchConfig();
  });

  const CustomForm = () => {
    return actionConfig ? (
      <>
        {actionConfig.dialog.form.inputs.map((input: any, index: number) => (
          <Input
            key={index}
            {...input}
            defaultValue={values?.[input.name] ?? ""}
          />
        ))}
      </>
    ) : (
      <></>
    );
  };

  if (!actionConfig || (formHocName && !formHocModule)) {
    return <FormSkeleton />;
  }

  const EnhancedForm = formHocModule
    ? formHocModule[formHocName](CustomForm)
    : CustomForm;

  return <EnhancedForm />;
};

export default ActionDialogForm;
