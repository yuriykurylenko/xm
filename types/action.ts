import { UUID } from "crypto";
import { Client, Coach } from "@/types/user";

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export type Action<T extends { id: UUID | string }, D = any, U = any> = {
  name?: string;
  title: string;
  titleBulk?: string;
  icon?: IconDefinition;
  show: (item: T) => boolean;
  handler?: (itemId: UUID, data: D) => Promise<U>;
  apiHandler?: (itemId: UUID, data?: D, context?: any) => Promise<U>;
  onComplete?: (
    item: T,
    setFilterStatus?: (filterStatus: string) => void
  ) => void | Promise<void>;
  DialogForm?: React.ComponentType<{ items: T[]; user: Client | Coach }>;
  Form?: React.ComponentType<{}>;
  formHoc?: any;
  submittingText?: string;
  dialogTitle?: string;
  dialogTitleBulk?: string;
  dialogText?: string;
  dialogTextBulk?: string;
  dialogInfoText?: string;
  dialogInfoTextBulk?: string;
};
