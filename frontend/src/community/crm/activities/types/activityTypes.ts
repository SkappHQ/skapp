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

export enum ActivityBucket {
  OVERDUE = "OVERDUE",
  TODAY = "TODAY",
  UPCOMING = "UPCOMING",
  BY_MONTH = "BY_MONTH"
}

export interface ActivityOwner {
  id: number;
  name: string;
  avatar: string | null;
}

export interface ActivityRelatedAssociation {
  id: number;
  name: string;
  deleted: boolean;
}

export interface ActivityRow {
  id: number;
  type: ActivityType;
  subject: string;
  dueAt: string | null;
  occurredAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  priority: CrmPriorityEnum | null;
  owner: ActivityOwner | null;
  contacts: ActivityRelatedAssociation[];
  deal: ActivityRelatedAssociation | null;
  company: ActivityRelatedAssociation | null;
  canComplete: boolean;
}

export type ActivityFeedResponse = ActivityRow[];

export interface ActivityFeedFilters {
  type?: ActivityType;
  search?: string;
  ownerId?: number;
  from?: string;
  to?: string;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface ActivityMonthGroup {
  monthKey: string;
  rows: ActivityRow[];
}

export interface ActivityBucketGroup {
  id: string;
  bucket: ActivityBucket;
  monthKey: string | null;
  rows: ActivityRow[];
}

export interface ActivityTabConfig {
  id: ActivityTab;
  labelKey: string;
  type: ActivityType | null;
}

export type ActivityTeamMember = ActivityOwner;

export enum ActivityDatePreset {
  TODAY = "TODAY",
  THIS_WEEK = "THIS_WEEK",
  THIS_MONTH = "THIS_MONTH",
  LAST_30_DAYS = "LAST_30_DAYS"
}

export interface ActivityFilterValues {
  ownerId: number | null;
  dateRange: DateRange;
}
