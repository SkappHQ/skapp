import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "../enums/common";

export const TASK_SEARCH_DEBOUNCE_DELAY = 500;

export interface PriorityConfig {
  IconComponent: FC;
  bgColor: string;
}

export const priorityOptions = [
  {
    label: "Low",
    key: "low",
    value: CrmPriorityEnum.LOW,
    bgColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text",
    IconComponent: LowPriorityIcon as FC
  },
  {
    label: "Medium",
    key: "medium",
    value: CrmPriorityEnum.MEDIUM,
    bgColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text",
    IconComponent: MediumPriorityIcon as FC
  },
  {
    label: "High",
    key: "high",
    value: CrmPriorityEnum.HIGH,
    bgColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text",
    IconComponent: HighPriorityIcon as FC
  }
];
