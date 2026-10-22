import {
  ActivityBucket,
  ActivityDatePreset,
  ActivityFeedResponse,
  ActivityFilterValues,
  ActivityTab,
  ActivityTabConfig,
  ActivityType,
  DateRange
} from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

export const ACTIVITY_PAGE_SIZE = 25;

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

export const ACTIVITY_BUCKET_ORDER: ActivityBucket[] = [
  ActivityBucket.OVERDUE,
  ActivityBucket.TODAY,
  ActivityBucket.UPCOMING,
  ActivityBucket.BY_MONTH
];

export const ACTIVITY_FIXED_BUCKET_KEYS: Record<
  Exclude<ActivityBucket, ActivityBucket.BY_MONTH>,
  keyof Pick<ActivityFeedResponse, "overdue" | "today" | "upcoming">
> = {
  [ActivityBucket.OVERDUE]: "overdue",
  [ActivityBucket.TODAY]: "today",
  [ActivityBucket.UPCOMING]: "upcoming"
};

export const ACTIVITY_BUCKET_LABEL_KEYS: Record<ActivityBucket, string> = {
  [ActivityBucket.OVERDUE]: "overdue",
  [ActivityBucket.TODAY]: "today",
  [ActivityBucket.UPCOMING]: "upcoming",
  [ActivityBucket.BY_MONTH]: "byMonth"
};

export const ACTIVITY_TYPE_LABEL_KEYS: Record<ActivityType, string> = {
  [ActivityType.TASK]: "task",
  [ActivityType.CALL]: "call",
  [ActivityType.MEETING]: "meeting",
  [ActivityType.EMAIL]: "email"
};

export const ACTIVITY_MONTH_KEY_FORMAT = "yyyy-MM";

export const ACTIVITY_MONTH_HEADING_FORMAT = "MMMM yyyy";

export const ACTIVITY_TIME_FORMAT = "h:mm a";

export const ACTIVITY_DATE_FORMAT = "yyyy-MM-dd";

export const ACTIVITY_MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec"
];

export const ACTIVITY_SKELETON_CONFIG = {
  groupCount: 3,
  rowCount: 4
};

export const ACTIVITY_TYPE_ICON_SIZE = 20;

export const ACTIVITY_TOOLBAR_ID = "crm-activity-toolbar";

export const ACTIVITY_FEED_ID = "crm-activity-feed";

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

export const EMPTY_ACTIVITY_DATE_RANGE: DateRange = { from: null, to: null };

export const EMPTY_ACTIVITY_FILTERS: ActivityFilterValues = {
  ownerId: null,
  dateRange: EMPTY_ACTIVITY_DATE_RANGE
};

export const ACTIVITY_PRIORITY_KEYS: Record<CrmPriorityEnum, string> = {
  [CrmPriorityEnum.HIGH]: "high",
  [CrmPriorityEnum.MEDIUM]: "medium",
  [CrmPriorityEnum.LOW]: "low"
};

export const ACTIVITY_PRIORITY_ORDER: CrmPriorityEnum[] = [
  CrmPriorityEnum.HIGH,
  CrmPriorityEnum.MEDIUM,
  CrmPriorityEnum.LOW
];

export const ACTIVITY_PRIORITY_STYLES: Record<
  CrmPriorityEnum,
  { backgroundColor: string; textColor: string }
> = {
  [CrmPriorityEnum.HIGH]: {
    backgroundColor: "bg-semantic-red-background",
    textColor: "text-semantic-red-text"
  },
  [CrmPriorityEnum.MEDIUM]: {
    backgroundColor: "bg-semantic-amber-background",
    textColor: "text-semantic-amber-text"
  },
  [CrmPriorityEnum.LOW]: {
    backgroundColor: "bg-semantic-green-background",
    textColor: "text-semantic-green-text"
  }
};

export const ACTIVITY_TASK_DETAIL_ICON_SIZE = 24;

export const ACTIVITY_TASK_PANEL_ID = "crm-activity-task-panel";
