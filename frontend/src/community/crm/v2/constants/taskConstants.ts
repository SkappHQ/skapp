import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import {
  CrmPriorityEnum,
  CrmTaskTabEnum
} from "~community/crm/v2/enums/common";

export const UNPAGED_SIZE = -1;

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
