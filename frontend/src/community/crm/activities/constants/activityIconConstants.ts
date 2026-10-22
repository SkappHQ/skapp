import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ComponentType, SVGProps } from "react";

import { ActivityType } from "~community/crm/activities/types/activityTypes";

export const ACTIVITY_TYPE_ICON_MAP: Record<
  ActivityType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  [ActivityType.TASK]: ChecklistVerificationFilledIcon,
  [ActivityType.CALL]: PhoneFilledIcon,
  [ActivityType.MEETING]: MeetingFilledIcon,
  [ActivityType.EMAIL]: EmailFilledIcon
};
