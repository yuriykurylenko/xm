import { Client, Coach } from "@/app/types/user";
import Input from "@/app/components/Form/Input";

export const EndClientFields: React.FC = () => (
  <>
    <Input
      name="endImmediately"
      type="checkbox"
      placeholder="End immediately"
    />
    <Input
      name="accessAfterEndDate"
      type="checkbox"
      placeholder="Allow platform access after the end of the engagement"
    />
  </>
);
