import { CrmPriorityEnum } from "~community/crm/enums/common";

export enum ActivityType {
  TASK = "TASK",
  CALL = "CALL",
  MEETING = "MEETING",
  EMAIL = "EMAIL"
}

export enum ActivityTab {
  ALL = "ALL",
  TASKS = "TASKS",
  CALLS = "CALLS",
  MEETINGS = "MEETINGS",
  EMAILS = "EMAILS"
}

export enum ActivitySection {
  OVERDUE = "OVERDUE",
  TODAY = "TODAY",
  UPCOMING = "UPCOMING",
  BY_MONTH = "BY_MONTH"
}

export enum ActivityDatePreset {
  TODAY = "TODAY",
  THIS_WEEK = "THIS_WEEK",
  THIS_MONTH = "THIS_MONTH",
  LAST_30_DAYS = "LAST_30_DAYS"
}

export interface ActivityRow {
  id: number;
  type: ActivityType;
  title: string;
  dueAt: string | null;
  loggedAt: string | null;
  startAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  priority: CrmPriorityEnum | null;
  ownerId: number | null;
  dealId: number | null;
  companyId: number | null;
  contactIds: number[];
  canComplete: boolean;
}

export interface ActivityFeedResponse {
  items: ActivityRow[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ActivityFeedFilters {
  type?: ActivityType;
  search?: string;
  ownerId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface ActivityDateRange {
  fromDate?: string;
  toDate?: string;
}

export interface ActivitySectionGroup {
  id: string;
  section: ActivitySection;
  monthKey: string | null;
  rows: ActivityRow[];
}

export interface ActivityOwner {
  id: number;
  name: string;
  avatar: string | null;
}

export type ActivityTeamMember = ActivityOwner;

export interface ActivityListParams {
  searchKeyword?: string;
  ownerId?: number;
  startDate?: string;
  endDate?: string;
}

interface ActivityListItemBase {
  id: number;
  ownerId: number | null;
  dealId: number | null;
  companyId: number | null;
}

export interface ActivityCallListItem extends ActivityListItemBase {
  subject: string | null;
  durationMinutes: number | null;
  loggedAt: string | null;
  contactId: number | null;
}

export interface ActivityMeetingListItem extends ActivityListItemBase {
  name: string | null;
  isScheduled: boolean;
  meetingVenue: string | null;
  location: string | null;
  startAt: string | null;
  endAt: string | null;
  contactIds: number[];
}

export interface ActivityEmailListItem extends ActivityListItemBase {
  subject: string | null;
  loggedAt: string | null;
  contactIds: number[];
}

export interface ActivityTaskListItem extends ActivityListItemBase {
  name: string | null;
  dueAt: string | null;
  priority: CrmPriorityEnum | null;
  isCompleted: boolean;
  completedAt: string | null;
  contactId: number | null;
}

export type ActivityListItem =
  | ActivityCallListItem
  | ActivityMeetingListItem
  | ActivityEmailListItem
  | ActivityTaskListItem;
