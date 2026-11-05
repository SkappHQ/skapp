import { ComponentType, SVGProps } from "react";

import {
  ActivityDatePreset,
  ActivitySection,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { TASK_TYPE_ICON_MAP } from "~community/crm/constants/taskConstants";

export const DEFAULT_ACTIVITY_TAB = ActivityTab.ALL;

export const ACTIVITY_SECTION_ORDER: ActivitySection[] = [
  ActivitySection.OVERDUE,
  ActivitySection.TODAY,
  ActivitySection.UPCOMING,
  ActivitySection.BY_MONTH
];

export const ACTIVITY_SECTION_LABEL_KEYS: Record<ActivitySection, string> = {
  [ActivitySection.OVERDUE]: "overdue",
  [ActivitySection.TODAY]: "today",
  [ActivitySection.UPCOMING]: "upcoming",
  [ActivitySection.BY_MONTH]: "byMonth"
};

export const ACTIVITY_DATE_PRESETS: ActivityDatePreset[] = [
  ActivityDatePreset.TODAY,
  ActivityDatePreset.THIS_WEEK,
  ActivityDatePreset.THIS_MONTH,
  ActivityDatePreset.LAST_30_DAYS
];

export const ACTIVITY_LAST_DAYS_PRESET_LENGTH = 30;

export const ACTIVITY_TYPE_ICON_MAP: Record<
  ActivityType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  [ActivityType.TASK]: TASK_TYPE_ICON_MAP.other,
  [ActivityType.CALL]: TASK_TYPE_ICON_MAP.call,
  [ActivityType.MEETING]: TASK_TYPE_ICON_MAP.meeting,
  [ActivityType.EMAIL]: TASK_TYPE_ICON_MAP.email
};

export const ACTIVITY_TIME_SLOT_MINUTES = 30;
