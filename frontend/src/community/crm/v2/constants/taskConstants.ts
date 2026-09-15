import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ComponentType, FC, SVGProps } from "react";

import {
  CrmPriorityEnum,
  CrmTaskTabEnum
} from "~community/crm/v2/enums/common";

export const TASK_PAGE_SIZE = 12;

export const TASK_DETAIL_ICON_SIZE = 24;

export const TASK_SKELETON_CONFIG = {
  COMPLETED: { rowCount: TASK_PAGE_SIZE, groupCount: 1 },
  OPEN: { rowCount: 4, groupCount: 4 }
};

export const SALES_REP_RESTRICTED_TASK_TABS: CrmTaskTabEnum[] = [
  CrmTaskTabEnum.ALL_TASKS
];

export const PRIORITY_OPTIONS = [
  {
    key: "high",
    value: CrmPriorityEnum.HIGH,
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text",
    IconComponent: HighPriorityIcon as FC
  },
  {
    key: "medium",
    value: CrmPriorityEnum.MEDIUM,
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text",
    IconComponent: MediumPriorityIcon as FC
  },
  {
    key: "low",
    value: CrmPriorityEnum.LOW,
    backgroundColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text",
    IconComponent: LowPriorityIcon as FC
  }
];

export const TASK_TYPE_ICON_MAP: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};
