import React, { FC } from "react";
import { useForm, UseFormProps, FormProvider } from "react-hook-form";
import styles from "@/app/components/Form/styles.module.css";

interface FormProps extends UseFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
}

export const Form: FC<FormProps> = ({ children, onSubmit, ...formProps }) => {
  const methods = useForm(formProps);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles["form"]}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;
