import { Client } from "@/types/user";
import PriceInput from "@/app/components/Form/PriceInput";
import Input from "@/app/components/Form/Input";

type ClientTermsFormFieldsProps = {
  items: Client[];
  values: any;
};

export const ClientTermsFormFields: React.FC<ClientTermsFormFieldsProps> = ({
  items,
  values: { monthly_amount },
}) => (
  <>
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
