import { AuthProps } from "@/app/hoc/withAuth";
import { Coach } from "@/app/types/coach";

export interface ClientApplicationPageProps extends AuthProps {
  coach: Coach;
}
