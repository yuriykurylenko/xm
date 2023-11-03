import React, { FC, MouseEventHandler } from "react";

// TODO: move styling closer.
import styles from "@/app/components/Form/styles.module.css";

interface BasicButtonProps {
  type?: "button" | "reset" | "submit";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: any;
}

export const BasicButton: FC<BasicButtonProps> = ({
  children,
  type = "button",
  disabled,
  onClick,
  className,
  ...props
}) => {
  return (
    <button
      className={`${className} ${styles["submit-btn"]}`}
      disabled={disabled}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default BasicButton;
