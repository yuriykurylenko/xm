import React, { FC } from "react";
import BasicButton from "@/app/components/BasicButton";
import { useFormStatus } from "@/app/components/Form";
import styles from "@/app/components/Form/styles.module.css";

interface FormButtonProps {
  type?: "submit";
  children: React.ReactNode;
  submittingText?: string;
  disabled?: boolean;
}

export const Button: FC<FormButtonProps> = ({
  children,
  submittingText,
  disabled,
  ...props
}) => {
  const { isSubmitting } = useFormStatus();
  const buttonText = isSubmitting
    ? submittingText || "Submitting..."
    : children;

  return (
    <>
      <BasicButton disabled={disabled || isSubmitting} {...props}>
        {buttonText}
      </BasicButton>
    </>
  );
};

export default Button;
