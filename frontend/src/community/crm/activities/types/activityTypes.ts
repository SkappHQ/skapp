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

export interface ActivityRelatedAssociation {
  id: number;
  name: string;
  isDeleted: boolean;
}

export interface ActivityRow {
  id: number;
  type: ActivityType;
  title: string;
  dueAt: string | null;
  occurredAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  priority: CrmPriorityEnum | null;
  ownerId: number | null;
  contacts: ActivityRelatedAssociation[];
  deal: ActivityRelatedAssociation | null;
  company: ActivityRelatedAssociation | null;
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

export type ActivityDateRange = Pick<
  ActivityFeedFilters,
  "fromDate" | "toDate"
>;

export interface ActivitySectionGroup {
  id: string;
  section: ActivitySection;
  monthKey: string | null;
  rows: ActivityRow[];
}

export interface ActivityTabConfig {
  id: ActivityTab;
  labelKey: string;
  type: ActivityType | null;
}
