import React from "react";

interface InputProps {
  name: string;
  placeholder: string;
  type?: string;
  register?: any;
  validation?: Record<string, any>;
  errors?: any;
}

const Input = ({
  name,
  placeholder,
  type = "text",
  register,
  validation,
  errors,
}: InputProps) => (
  <div>
    <input
      {...register(name, validation)}
      placeholder={placeholder}
      type={type}
    />
    {errors[name] && <p>{errors[name].message}</p>}
  </div>
);

export default Input;
