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
