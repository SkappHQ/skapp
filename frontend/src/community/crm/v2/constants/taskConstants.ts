import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

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
