import React, { FC } from "react";
import { useFormContext } from "react-hook-form";
import styles from "@/app/components/Form/styles.module.css";

export type ValidationRule = {
  required?: string | boolean;
  minLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
};

export type InputType = "email" | "password" | "number" | "text";

export interface InputProps {
  name: string;
  type?: InputType;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  className?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const Input: FC<InputProps> = ({
  name,
  type = "text",
  placeholder,
  required,
  validation,
  className,
  defaultValue,
  disabled,
  min,
  max,
  step,
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
          disabled={disabled}
          defaultValue={defaultValue}
          {...register(name, inputValidation)}
          min={min}
          max={max}
          step={step}
        />
        <p className={styles["error-message"]}>
          <>{errors[name] ? errors[name]?.message : ""}</>
        </p>
      </div>
    </>
  );
};

export default Input;
