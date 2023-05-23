import React, { FC } from "react";
import {
  useForm,
  UseFormProps,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import styles from "@/app/components/Form/styles.module.css";

interface FormProps extends UseFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
}

export const Form: FC<FormProps> = ({ children, onSubmit, ...formProps }) => {
  const methods = useForm(formProps);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles["form"]}>{children}</form>
    </FormProvider>
  );
};

interface InputProps {
  name: string;
  type?: string;
  placeholder?: string;
  validation?: any;
  className?: string;
}

export const Input: FC<InputProps> = ({
  name,
  type = "text",
  placeholder,
  validation,
  className,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <>
    <div className={`${styles["input-container"]} ${className || ""}`}>
      <input
        className={`${styles["input"]}`}
        type={type}
        placeholder={placeholder}
        {...register(name, validation)}
      />
    {(
        // @ts-ignore
        <p className={styles["error-message"]}>{errors[name] ? errors[name].message : ""}</p>
)}
    </div>
    </>
  );
};

export default Form;
