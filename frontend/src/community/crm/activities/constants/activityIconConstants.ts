import { ComponentType, SVGProps } from "react";

import { ActivityType } from "~community/crm/activities/types/activityTypes";
import { TASK_TYPE_ICON_MAP } from "~community/crm/constants/taskConstants";

export const ACTIVITY_TYPE_ICON_MAP: Record<
  ActivityType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  [ActivityType.TASK]: TASK_TYPE_ICON_MAP.other,
  [ActivityType.CALL]: TASK_TYPE_ICON_MAP.call,
  [ActivityType.MEETING]: TASK_TYPE_ICON_MAP.meeting,
  [ActivityType.EMAIL]: TASK_TYPE_ICON_MAP.email
};
