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

export const TASK_SEARCH_DEBOUNCE_DELAY = 500;

export interface PriorityOption {
  label: string;
  key: string;
  value: CrmPriorityEnum;
  backgroundColor: string;
  textColor: string;
  IconComponent: FC;
}

export const priorityOptions: PriorityOption[] = [
  {
    label: "Low",
    key: "low",
    value: CrmPriorityEnum.LOW,
    backgroundColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text",
    IconComponent: LowPriorityIcon
  },
  {
    label: "Medium",
    key: "medium",
    value: CrmPriorityEnum.MEDIUM,
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text",
    IconComponent: MediumPriorityIcon
  },
  {
    label: "High",
    key: "high",
    value: CrmPriorityEnum.HIGH,
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text",
    IconComponent: HighPriorityIcon
  }
];

export const getPriorityConfig = (
  priority: CrmPriorityEnum
): PriorityOption | undefined =>
  priorityOptions.find((o) => o.value === priority);

const TASK_TYPE_ICON_MAP: Record<string, FC> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (typeName: string): FC | undefined =>
  TASK_TYPE_ICON_MAP[typeName.toLowerCase()];
