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

export const ACTIVITY_PRIORITY_ICON_MAP: Record<CrmPriorityEnum, FC> = {
  [CrmPriorityEnum.HIGH]: HighPriorityIcon as FC,
  [CrmPriorityEnum.MEDIUM]: MediumPriorityIcon as FC,
  [CrmPriorityEnum.LOW]: LowPriorityIcon as FC
};
