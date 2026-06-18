import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import {
  CrmPriorityEnum,
  CrmTaskTabEnum
} from "../enums/common";

export const TASK_SEARCH_DEBOUNCE_DELAY = 500;

export const DEFAULT_PAGE_SIZE = 12;

export const DEFAULT_SCROLL_THRESHOLD = 0.8;

export const SALES_REP_RESTRICTED_TASK_TABS = [CrmTaskTabEnum.TEAM_TASKS];

export const PRIORITY_OPTIONS = [
  {
    key: "low",
    value: CrmPriorityEnum.LOW,
    backgroundColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text",
    IconComponent: LowPriorityIcon as FC
  },
  {
    key: "medium",
    value: CrmPriorityEnum.MEDIUM,
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text",
    IconComponent: MediumPriorityIcon as FC
  },
  {
    key: "high",
    value: CrmPriorityEnum.HIGH,
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text",
    IconComponent: HighPriorityIcon as FC
  }
];
