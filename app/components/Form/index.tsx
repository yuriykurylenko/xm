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
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles["form"]}
      >
        {children}
      </form>
    </FormProvider>
  );
};

type ValidationRule = {
  required?: string | boolean;
  minLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
};

type InputType = "email" | "password" | "number" | "text";

interface InputProps {
  name: string;
  type?: InputType;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  className?: string;
  value?: string;
  disabled?: boolean;
}

export const Input: FC<InputProps> = ({
  name,
  type = "text",
  placeholder,
  required,
  validation,
  className,
  value,
  disabled,
}) => {
  const validations: Record<InputType, ValidationRule> = {
    email: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        message: "Invalid email address",
      },
    },
    password: {},
    text: {},
    number: {},
  };

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const inputValidation = {
    ...validations[type],
    ...(required ? { required: `${placeholder} is required` } : {}),
    ...validation,
  };

  return (
    <>
      <div className={`${styles["input-container"]} ${className || ""}`}>
        <input
          className={`${styles["input"]} ${
            errors[name] ? styles["error"] : ""
          }`}
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          {...register(name, inputValidation)}
        />
        <p className={styles["error-message"]}>
          <>{errors[name] ? errors[name]?.message : ""}</>
        </p>
      </div>
    </>
  );
};

interface ButtonProps {
  type: "button" | "reset" | "submit";
  disabled: boolean;
  children: React.ReactNode;
  error?: string;
}

export const Button: FC<ButtonProps> = ({
  children,
  type,
  disabled,
  error,
  ...props
}) => {
  return (
    <>
      <button className={styles["submit-btn"]} disabled={disabled} {...props}>
        {children}
      </button>
      {error && (
        <p className={styles["submit-error-message"]}>
          <>{error || ""}</>
        </p>
      )}
    </>
  );
};

export default Form;
