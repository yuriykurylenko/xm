import React, { FC, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from "@/app/components/Form/styles.module.css";

export type ValidationRule = {
  required?: string | boolean;
  minLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
};

export type InputType =
  | "email"
  | "password"
  | "number"
  | "text"
  | "checkbox"
  | "date";

export interface InputProps {
  name: string;
  type?: InputType;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule;
  className?: string;
  defaultValue?: string | number | Date;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  checked?: boolean;
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
  checked,
}) => {
  // const [date, setDate] = useState(defaultValue as Date);

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
    checkbox: {},
    date: {},
  };

  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  const inputValidation = {
    ...validations[type],
    ...(required ? { required: `${placeholder} is required` } : {}),
    ...validation,
  };

  const inputElement = (
    <input
      className={`${styles["input"]} ${errors[name] ? styles["error"] : ""}`}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      // @ts-ignore
      defaultValue={defaultValue}
      {...register(name, inputValidation)}
      min={min}
      max={max}
      step={step}
      checked={checked}
    />
  );

  return (
    <>
      <div className={`${styles["input-container"]} ${className || ""}`}>
        {type === "checkbox" ? (
          <label>
            {inputElement}
            {placeholder}
          </label>
        ) : type === "date" ? (
          <label>
            <span className={styles["datepicker-label"]}>{placeholder}</span>
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  className={`${styles["input"]} ${className || ""}`}
                  selected={value || new Date()}
                  onChange={onChange}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                />
              )}
            />
          </label>
        ) : (
          inputElement
        )}
        <p className={styles["error-message"]}>
          <>{errors[name] ? errors[name]?.message : ""}</>
        </p>
      </div>
    </>
  );
};

export default Input;
