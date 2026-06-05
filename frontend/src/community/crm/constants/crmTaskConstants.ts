import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";

export interface PriorityConfig {
  IconComponent: FC;
  bgColor: string;
}

const PRIORITY_CONFIG_MAP: Record<CrmPriorityEnum, PriorityConfig> = {
  [CrmPriorityEnum.HIGH]: {
    IconComponent: HighPriorityIcon,
    bgColor: "bg-semantic-red-background"
  },
  [CrmPriorityEnum.MEDIUM]: {
    IconComponent: MediumPriorityIcon,
    bgColor: "bg-semantic-amber-background"
  },
  [CrmPriorityEnum.LOW]: {
    IconComponent: LowPriorityIcon,
    bgColor: "bg-semantic-green-background"
  }
};

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): PriorityConfig | undefined => {
  return PRIORITY_CONFIG_MAP[priority];
};

const TASK_TYPE_ICON_MAP: Record<string, FC> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): FC | undefined =>
  TASK_TYPE_ICON_MAP[typeName.toLowerCase()];
