import React, { FC } from "react";
import styles from "@/app/components/Form/styles.module.css";
import { useFormStatus } from "@/app/components/Form";

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
  const { isSubmitting, errorMessage } = useFormStatus();

  return (
    <>
      <button
        className={styles["submit-btn"]}
        disabled={isSubmitting}
        {...props}
      >
        {isSubmitting ? "Submitting..." : children}
      </button>
      {errorMessage && (
        <p className={styles["submit-error-message"]}>
          <>{errorMessage || ""}</>
        </p>
      )}
    </>
  );
};

export default Button;
