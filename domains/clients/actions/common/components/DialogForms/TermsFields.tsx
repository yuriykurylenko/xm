import { Client, Coach } from "@/types/user";
import PriceInput from "@/app/components/Form/PriceInput";
import Input from "@/app/components/Form/Input";

type ClientTermsFormFieldsProps = {
  items: Client[];
  coach: Coach;
};

export const ClientTermsFormFields: React.FC<ClientTermsFormFieldsProps> = ({
  items,
  coach,
}) => (
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
    <Input
      name="startDate"
      type="date"
      placeholder="Start date"
      defaultValue={
        items.length === 1 ? items[0]?.start_date || new Date() : new Date()
      }
    />
    <Input
      name="trialPeriod"
      type="checkbox"
      placeholder="Offer trial period (14 days)"
      defaultValue={
        items.length === 1 && Boolean(items[0]?.subscription?.trial_period_days)
      }
    />
  </>
);
