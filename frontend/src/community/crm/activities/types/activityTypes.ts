import { ReactNode } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmMeetingVenueDetails } from "~enterprise/crm/types/ScheduleMeetingTypes";

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

export interface ActivityRow extends CrmMeetingVenueDetails {
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

export interface ActivityRowSubtitlePart {
  key: string;
  isVisible: boolean;
  content: ReactNode;
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

export interface ActivityEmailCreatePayload {
  fromAddress: string | null;
  loggedAt: string | null;
  toContactIds: number[];
  ccContactIds: number[];
  bccContactIds: number[];
  subject: string;
  dealId: number | null;
  companyId: number | null;
  description: string;
}

export interface ActivityEmailResponse extends ActivityListItemBase {
  subject: string;
  loggedAt: string | null;
  contactIds: number[];
}

export interface ActivityMeetingResponse
  extends ActivityListItemBase, CrmMeetingVenueDetails {
  name: string;
  meetingDate: string | null;
  startAt: string | null;
  contactIds: number[];
}

export interface ActivityTaskResponse extends ActivityListItemBase {
  name: string;
  dueAt: string | null;
  priority: CrmPriorityEnum;
  isCompleted: boolean;
  completedAt: string | null;
  contactId: number | null;
}

export interface ActivityCallCreatePayload {
  subject: string;
  loggedAt: string | null;
  durationMinutes: number | null;
  contactId: number | null;
  dealId: number | null;
  companyId: number | null;
  ownerId: number | null;
  comments: string;
}

export interface ActivityMeetingCreatePayload {
  name: string;
  meetingDate: string | null;
  startAt: string | null;
  endAt: string | null;
  contactIds: number[];
  dealId: number | null;
  companyId: number | null;
  ownerId: number | null;
  comments: string;
}

export interface ActivityTaskCreatePayload {
  name: string;
  priority: CrmPriorityEnum;
  dueAt: string | null;
  ownerId: number | null;
  contactId: number | null;
  dealId: number | null;
  companyId: number | null;
  notes: string;
}

export interface ActivityLinkEditPayload {
  ownerId?: number;
  dealId?: number;
  isDealRemoved?: boolean;
  companyId?: number;
  isCompanyRemoved?: boolean;
}

export interface ActivityCallEditPayload extends ActivityLinkEditPayload {
  id: number;
  subject?: string;
  comments?: string;
  loggedAt?: string | null;
  durationMinutes?: number | null;
  contactId?: number;
}

export interface ActivityMeetingEditPayload extends ActivityLinkEditPayload {
  id: number;
  name?: string;
  comments?: string;
  meetingDate?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  contactIds?: number[];
}

export interface ActivityTaskEditPayload extends ActivityLinkEditPayload {
  id: number;
  name?: string;
  notes?: string;
  isCompleted?: boolean;
  priority?: CrmPriorityEnum;
  dueAt?: string | null;
  contactId?: number;
}
