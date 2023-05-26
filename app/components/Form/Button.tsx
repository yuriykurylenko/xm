import React, { FC } from "react";
import styles from "@/app/components/Form/styles.module.css";

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

export default Button;
