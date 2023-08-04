import React, { ReactNode, createContext, useContext, useState } from "react";
import {
  useForm,
  UseFormProps,
  FormProvider,
  useFormContext,
  FieldValues,
  SubmitHandler,
} from "react-hook-form";
import styles from "@/app/components/Form/styles.module.css";

interface FormProps<T extends FieldValues> extends UseFormProps {
  children: React.ReactNode;
  onSubmit: (data: T) => Promise<any>;
}

interface FormStatusContextProps {
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

interface FormStatusProviderProps {
  children: React.ReactNode;
}

export const FormStatusContext = createContext<FormStatusContextProps | null>(
  null
);

export const useFormStatus = () => {
  const context = useContext(FormStatusContext);
  if (!context) {
    throw new Error("useFormStatus must be used within a FormStatusProvider");
  }
  return context;
};

export const FormStatusProvider: React.FC<FormStatusProviderProps> = ({
  children,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <FormStatusContext.Provider
      value={{ isSubmitting, setIsSubmitting, errorMessage, setErrorMessage }}
    >
      {children}
      {errorMessage && (
        <p className={styles["submit-error-message"]}>{errorMessage}</p>
      )}
    </FormStatusContext.Provider>
  );
};

interface FormInnerProps<T extends FieldValues> {
  children: ReactNode;
  onSubmit: (data: T) => Promise<any>;
}

const FormInner = <T extends FieldValues>({
  children,
  onSubmit,
  ...formProps
}: FormInnerProps<T>) => {
  const { handleSubmit } = useFormContext();
  const { setIsSubmitting, setErrorMessage } = useFormStatus();

  const handleSubmitInner = async (data: T) => {
    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await onSubmit(data);
    if (error?.message) {
      setErrorMessage(error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit(handleSubmitInner as SubmitHandler<FieldValues>)}
      {...formProps}
    >
      {children}
    </form>
  );
};

export const Form = <T extends FieldValues>({
  children,
  onSubmit,
  ...formProps
}: FormProps<T>) => {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <FormStatusProvider>
        <FormInner onSubmit={onSubmit} {...formProps}>
          {children}
        </FormInner>
      </FormStatusProvider>
    </FormProvider>
  );
};

export default Form;
