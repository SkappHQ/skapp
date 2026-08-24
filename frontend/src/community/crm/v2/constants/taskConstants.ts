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

import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

export const TASK_TYPE_ICON_SIZE = 20;

export const TASK_TYPE_ICONS: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const PRIORITY_OPTIONS = [
  {
    value: CrmPriorityEnum.HIGH,
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text",
    IconComponent: HighPriorityIcon as FC
  },
  {
    value: CrmPriorityEnum.MEDIUM,
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text",
    IconComponent: MediumPriorityIcon as FC
  },
  {
    value: CrmPriorityEnum.LOW,
    backgroundColor: "bg-secondary-accent",
    textColor: "text-secondary-text",
    IconComponent: LowPriorityIcon as FC
  }
];
