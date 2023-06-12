import { AuthProps } from "../hoc/withAuth";
import { Coach } from "./coach";

export interface ClientApplicationPageProps extends AuthProps {
  coach: Coach;
}
