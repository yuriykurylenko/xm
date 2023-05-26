import React, { FC, useState } from "react";
import { useForm, UseFormProps, FormProvider } from "react-hook-form";
import styles from "@/app/components/Form/styles.module.css";

interface FormProps extends UseFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
}

export const SubmittingContext = React.createContext(false);

export const Form: FC<FormProps> = ({ children, onSubmit, ...formProps }) => {
  const methods = useForm(formProps);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SubmittingContext.Provider value={submitting}>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className={styles["form"]}
          noValidate
        >
          {children}
        </form>
      </FormProvider>
    </SubmittingContext.Provider>
  );
};

export default Form;
