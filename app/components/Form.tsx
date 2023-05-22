import React, { FC } from "react";
import {
  useForm,
  UseFormProps,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import styles from "@/app/styles/form.module.css";

interface FormProps extends UseFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
}

export const Form: FC<FormProps> = ({ children, onSubmit, ...formProps }) => {
  const methods = useForm(formProps);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
};

interface InputProps {
  name: string;
  type?: string;
  placeholder?: string;
  validation?: any;
}

export const Input: FC<InputProps> = ({
  name,
  type = "text",
  placeholder,
  validation,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name, validation)}
      />
      {errors[name] && (
        // @ts-ignore
        <p className={styles["error-message"]}>{errors[name].message}</p>
      )}
    </>
  );
};

export default Form;
