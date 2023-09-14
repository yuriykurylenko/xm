import { Client, Coach } from "@/types/user";
import PriceInput from "@/app/components/Form/PriceInput";
import Input from "@/app/components/Form/Input";

type PriceFieldProps = {
  items: Client[];
  coach: Coach;
};

export const PriceField: React.FC<PriceFieldProps> = ({ items, coach }) => (
  <>
    <PriceInput
      name="monthlyAmount"
      placeholder="Monthly price"
      required
      defaultValue={
        items.length === 1
          ? (items[0]?.subscription?.monthly_amount ||
              coach.monthly_subscription_amount) / 100
          : coach.monthly_subscription_amount / 100
      }
    />
  </>
);
