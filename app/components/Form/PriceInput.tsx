import Input from "@/app/components/Form/Input";
import styles from "@/app/components/Form/styles.module.css";
import { InputProps } from "./types";

interface PriceInputProps extends Omit<InputProps, "type" | "min" | "step"> {}

const PriceInput: React.FC<PriceInputProps> = (props) => {
  return (
    <Input
      {...props}
      className={`${styles["price-input"]} ${props.className || ""}`}
      type="number"
      min={0}
      step={1}
    />
  );
};

export default PriceInput;
