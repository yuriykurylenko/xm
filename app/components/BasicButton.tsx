import React, { FC } from "react";
import styles from "@/app/components/Form/styles.module.css";

interface BaseButtonProps {
  type?: "button" | "reset" | "submit";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: any;
}

export const BaseButton: FC<BaseButtonProps> = ({
  children,
  type = "button",
  disabled,
  onClick,
  ...props
}) => {
  return (
    <button
      className={styles["submit-btn"]}
      disabled={disabled}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default BaseButton;
