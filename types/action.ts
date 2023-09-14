import { UUID } from "crypto";
import { Client, Coach } from "@/types/user";

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export type Action<T extends { id: UUID | string }, D = any, U = any> = {
  name: string;
  title: string;
  titleBulk: string;
  icon: IconDefinition;
  show: (item: T) => boolean;
  handler?: (itemId: UUID, data: D) => Promise<U>;
  apiOperation?: string;
  onComplete?: (setFilterStatus?: (filterStatus: string) => void) => void;
  DialogForm?: React.ComponentType<{ items: T[]; user: Client | Coach }>;
  dialogTitle: string;
  dialogTitleBulk: string;
  dialogText?: string;
  dialogTextBulk?: string;
  dialogInfoText?: string;
  dialogInfoTextBulk?: string;
};
