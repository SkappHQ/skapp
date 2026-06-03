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
    bgColor:
      "bg-semantic-red-background [&_path]:fill-[var(--color-semantic-amber-text)]"
  },
  medium: {
    IconComponent: MediumPriorityIcon,
    bgColor: "bg-amber-100 [&_path]:fill-[var(--color-semantic-amber-accent)]"
  },
  low: {
    IconComponent: LowPriorityIcon,
    bgColor:
      "bg-semantic-green-background [&_path]:fill-[var(--color-semantic-green-text)]"
  }
};

export const getPriorityConfig = (priority: CrmPriorityEnum): PriorityConfig =>
  PRIORITY_CONFIG_MAP[priority.toLowerCase()] ?? PRIORITY_CONFIG_MAP.low;

// TODO: Task types are dynamic (fetched from the backend API).

const TASK_TYPE_ICON_MAP: Record<string, FC> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): FC =>
  TASK_TYPE_ICON_MAP[typeName.toLowerCase()] ?? ChecklistVerificationFilledIcon;
