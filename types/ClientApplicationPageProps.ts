import { AuthProps } from "@/app/hoc/withAuth";
import { Coach } from "@/types/user";

export interface ClientApplicationPageProps extends AuthProps {
  coach: Coach;
}
