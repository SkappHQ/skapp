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

const PRIORITY_CONFIG_MAP: Record<string, PriorityConfig> = {
  high: {
    IconComponent: HighPriorityIcon,
    bgColor: "bg-semantic-red-background"
  },
  medium: {
    IconComponent: MediumPriorityIcon,
    bgColor: "bg-amber-100"
  },
  low: {
    IconComponent: LowPriorityIcon,
    bgColor: "bg-semantic-green-background"
  }
};

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): PriorityConfig | undefined => {
  const name =
    typeof priority === "object"
      ? (priority as unknown as { name: string }).name
      : priority;
  return PRIORITY_CONFIG_MAP[name.toLowerCase()];
};

const TASK_TYPE_ICON_MAP: Record<string, FC> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): FC | undefined =>
  TASK_TYPE_ICON_MAP[typeName.toLowerCase()];
