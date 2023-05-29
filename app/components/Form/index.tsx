import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import {
  useForm,
  UseFormProps,
  FormProvider,
  useFormContext,
} from "react-hook-form";

interface FormProps extends UseFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => any;
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
    </FormStatusContext.Provider>
  );
};

interface FormInnerProps {
  children: ReactNode;
  onSubmit: (data: any) => Promise<any>;
}

const FormInner: FC<FormInnerProps> = ({
  children,
  onSubmit,
  ...formProps
}) => {
  const {
    handleSubmit,
    formState: { errors },
  } = useFormContext();
  const { setIsSubmitting, setErrorMessage } = useFormStatus();

  const handleSubmitInner = async (data: any) => {
    setIsSubmitting(true);
    const { error } = await onSubmit(data);
    if (error?.message) {
      setErrorMessage(error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitInner)} {...formProps}>
      {children}
    </form>
  );
};

export const Form: FC<FormProps> = ({ children, onSubmit, ...formProps }) => {
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
