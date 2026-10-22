import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ComponentType, SVGProps } from "react";

import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

export const ACTIVITY_TYPE_ICON_MAP: Record<
  ActivityType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  [ActivityType.TASK]: ChecklistVerificationFilledIcon,
  [ActivityType.CALL]: PhoneFilledIcon,
  [ActivityType.MEETING]: MeetingFilledIcon,
  [ActivityType.EMAIL]: EmailFilledIcon
};

export const ACTIVITY_PRIORITY_CONFIG: Record<
  CrmPriorityEnum,
  {
    ariaKey: string;
    backgroundClass: string;
    textClass: string;
    Icon: ComponentType<{ size?: number }>;
  }
> = {
  [CrmPriorityEnum.HIGH]: {
    ariaKey: "highPriority",
    backgroundClass: "bg-semantic-red-background",
    textClass: "text-semantic-red-text",
    Icon: HighPriorityIcon
  },
  [CrmPriorityEnum.MEDIUM]: {
    ariaKey: "mediumPriority",
    backgroundClass: "bg-semantic-amber-background",
    textClass: "text-semantic-amber-text",
    Icon: MediumPriorityIcon
  },
  [CrmPriorityEnum.LOW]: {
    ariaKey: "lowPriority",
    backgroundClass: "bg-semantic-green-background",
    textClass: "text-semantic-green-text",
    Icon: LowPriorityIcon
  }
};
