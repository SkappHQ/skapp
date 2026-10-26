import {
  ActivityDatePreset,
  ActivitySection,
  ActivityTab,
  ActivityTabConfig,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

export const ACTIVITY_TABS: ActivityTabConfig[] = [
  { id: ActivityTab.ALL, labelKey: "all", type: null },
  { id: ActivityTab.TASKS, labelKey: "tasks", type: ActivityType.TASK },
  { id: ActivityTab.CALLS, labelKey: "calls", type: ActivityType.CALL },
  {
    id: ActivityTab.MEETINGS,
    labelKey: "meetings",
    type: ActivityType.MEETING
  },
  { id: ActivityTab.EMAILS, labelKey: "emails", type: ActivityType.EMAIL }
];

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

export const ACTIVITY_TYPE_LABEL_KEYS: Record<ActivityType, string> = {
  [ActivityType.TASK]: "task",
  [ActivityType.CALL]: "call",
  [ActivityType.MEETING]: "meeting",
  [ActivityType.EMAIL]: "email"
};

export const ACTIVITY_DATE_PRESETS: {
  id: ActivityDatePreset;
  labelKey: string;
}[] = [
  { id: ActivityDatePreset.TODAY, labelKey: "today" },
  { id: ActivityDatePreset.THIS_WEEK, labelKey: "thisWeek" },
  { id: ActivityDatePreset.THIS_MONTH, labelKey: "thisMonth" },
  { id: ActivityDatePreset.LAST_30_DAYS, labelKey: "last30Days" }
];

export const ACTIVITY_LAST_DAYS_PRESET_LENGTH = 30;
