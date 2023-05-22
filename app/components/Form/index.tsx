import { useForm, FieldValues } from "react-hook-form";
import React from "react";

interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: FieldValues) => void;
  defaultValues?: FieldValues;
  className?: string;
}

const Form = ({ children, onSubmit, defaultValues, className }: FormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          register,
          errors,
        });
      })}
    </form>
  );
};

export default Form;
