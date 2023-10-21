import { Client, Coach } from "@/types/user";
import PriceInput from "@/app/components/Form/PriceInput";

type PriceFieldProps = {
  items: Client[];
  values: { monthly_amount: number };
};

export const PriceField: React.FC<PriceFieldProps> = ({
  items,
  values: { monthly_amount },
}) => (
  <PriceInput
    name="monthlyAmount"
    placeholder="Monthly price"
    required
    defaultValue={
      items.length === 1
        ? (items[0]?.subscription?.monthly_amount || monthly_amount) / 100
        : monthly_amount / 100
    }
  />
);
