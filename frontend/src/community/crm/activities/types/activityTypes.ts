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

export type ActivityFilterValues = Pick<
  ActivityFeedFilters,
  "ownerId" | "fromDate" | "toDate"
>;

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

export interface ActivityListFilters {
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

export interface ActivityCallResponse extends ActivityListItemBase {
  subject: string;
  loggedAt: string | null;
  contactId: number | null;
}

export interface ActivityEmailResponse extends ActivityListItemBase {
  subject: string;
  loggedAt: string | null;
  contactIds: number[];
}

export interface ActivityMeetingResponse extends ActivityListItemBase {
  name: string;
  startAt: string | null;
  contactIds: number[];
}

export interface ActivityTaskResponse extends ActivityListItemBase {
  name: string;
  dueAt: string | null;
  priority: CrmPriorityEnum | null;
  isCompleted: boolean;
  completedAt: string | null;
  contactId: number | null;
}

export interface ActivityCallCreatePayload {
  subject: string;
  loggedAt?: string;
  durationMinutes?: number;
  contactId: number;
  dealId?: number;
  companyId?: number;
  ownerId: number;
  comments?: string;
}
