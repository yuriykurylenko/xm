import React, { FC, useContext } from "react";
import styles from "@/app/components/Form/styles.module.css";
import { SubmittingContext } from ".";

interface ButtonProps {
  type: "button" | "reset" | "submit";
  children: React.ReactNode;
  error?: string;
  disabled?: boolean;
  submittingText?: string;
}

export const Button: FC<ButtonProps> = ({
  children,
  type,
  error,
  disabled,
  submittingText,
  ...props
}) => {
  const submitting = useContext(SubmittingContext);

  return (
    <>
      <button
        className={styles["submit-btn"]}
        disabled={disabled || submitting}
        {...props}
      >
        {submitting && submittingText ? submittingText : children}
      </button>
      {error && (
        <p className={styles["submit-error-message"]}>
          <>{error || ""}</>
        </p>
      )}
    </>
  );
};

export default Button;
