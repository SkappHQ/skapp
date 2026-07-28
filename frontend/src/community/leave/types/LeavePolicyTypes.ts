import { DateTime } from "luxon";

export enum PolicyType {
  ACCRUAL = "ACCRUAL",
  FLEXIBLE = "FLEXIBLE"
}

export enum LeavePolicyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum LeavePolicyWizardSteps {
  BASIC_INFO = 0,
  ENTITLEMENT_SETUP = 1,
  SUMMARY = 2
}

export enum AccrualFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  EVERY_OTHER_WEEK = "EVERY_OTHER_WEEK",
  TWICE_A_MONTH = "TWICE_A_MONTH",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  TWICE_A_YEAR = "TWICE_A_YEAR",
  YEARLY = "YEARLY",
  ON_ANNIVERSARY = "ON_ANNIVERSARY"
}

export enum FirstAccrualType {
  PRORATED = "PRORATED",
  FULL = "FULL"
}

export enum AccrualTiming {
  PERIOD_START = "PERIOD_START",
  PERIOD_END = "PERIOD_END"
}

export interface LeavePolicyType {
  id: number;
  name: string;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeEmoji: string | null;
  policyType: PolicyType;
  status: LeavePolicyStatus;
  // Accrual configuration is returned by the list endpoint for ACCRUAL policies.
  accrualDays?: number | null;
  frequency?: AccrualFrequency | null;
  waitingPeriodDays?: number | null;
  accrualCapDays?: number | null;
  isCarryoverEnabled?: boolean | null;
  carryoverDate?: string | null;
  maxCarryoverDays?: number | null;
  firstAccrual?: FirstAccrualType | null;
  accrualTiming?: AccrualTiming | null;
}

// Calendar units that a luxon DateTime can align to, used when prorating the
// first partial accrual period against real calendar boundaries.
export type CalendarUnit = "day" | "week" | "month" | "quarter" | "year";

// A single row in the accrual schedule preview shown in the assign modal.
export interface AccrualPreviewRow {
  date: string;
  days: number;
  balance: number;
}

// One accrual event (a date on which days are granted) in the projection.
export interface AccrualEvent {
  date: DateTime;
  days: number;
}

// Resolved inputs that drive the accrual projection.
export interface ScheduleConfig {
  base: DateTime;
  perPeriod: number;
  prorateFirst: boolean;
  atPeriodStart: boolean;
  // When set (carry-over disabled), stop projecting after this year.
  lastYear: number | null;
}

export interface LeavePoliciesPage {
  items: LeavePolicyType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface GetLeavePoliciesInfiniteArgs {
  searchKeyword: string;
  leaveTypeId: string;
  size: number;
}

export interface GetLeavePoliciesParams {
  searchKeyword?: string;
  leaveTypeId?: string;
  page: number;
  size: number;
}

export interface LeavePoliciesResponse {
  results: LeavePoliciesPage[];
}

export interface PolicyLeaveTypeType {
  id: number;
  name: string;
  emojiCode: string | null;
  colorCode: string | null;
}

export interface PolicyLeaveTypesResult {
  leaveTypes: PolicyLeaveTypeType[];
}

export interface PolicyLeaveTypesResponse {
  results: PolicyLeaveTypesResult[];
}

export interface LeavePolicyFormData {
  policyType: PolicyType | null;
  policyName: string;
  leaveType: string;
  leaveTypeName: string;
  accrualDays: string;
  accrualFrequency: string;
  hasWaitingPeriod: boolean;
  waitingPeriodDays: string;
  hasAccrualCap: boolean;
  accrualCapDays: string;
  canCarryOver: boolean;
  carryOverDate: string;
  maxCarryOverDays: string;
  firstAccrual: string;
  receiveAccruedTime: string;
}

export interface AddLeavePolicyAccrualPayload {
  accrualDays: number;
  frequency: string;
  waitingPeriodDays?: number;
  accrualCapDays?: number;
  isCarryoverEnabled: boolean;
  carryoverDate?: string;
  maxCarryoverDays?: number;
  firstAccrual: string;
  accrualTiming: string;
}

export interface AddLeavePolicyPayload {
  name: string;
  leaveTypeId: number;
  policyType: PolicyType;
  accrual?: AddLeavePolicyAccrualPayload;
}

export interface UpdateLeavePolicyPayload {
  name: string;
}

export interface UpdateLeavePolicyVariables {
  id: number;
  payload: UpdateLeavePolicyPayload;
}

export interface LeavePolicyResponseDto {
  id: number;
  name: string;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeEmoji: string | null;
  policyType: PolicyType;
  status: LeavePolicyStatus;
  accrualDays: number | null;
  frequency: AccrualFrequency | null;
  waitingPeriodDays: number | null;
  accrualCapDays: number | null;
  isCarryoverEnabled: boolean | null;
  carryoverDate: string | null;
  maxCarryoverDays: number | null;
  firstAccrual: FirstAccrualType | null;
  accrualTiming: AccrualTiming | null;
}

export interface LeavePolicyMutationResponse {
  results: LeavePolicyResponseDto[];
}

export enum EffectiveDateType {
  HIRE_DATE = "HIRE_DATE",
  SPECIFIC = "SPECIFIC"
}

export enum EmployeeLeavePolicyStatus {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED"
}

export interface EmployeeLeavePolicyType {
  id: number;
  employeeId: number;
  policyId: number;
  policyName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeEmojiCode: string | null;
  policyType: PolicyType;
  effectiveDateType: EffectiveDateType;
  effectiveFrom: string;
  status: EmployeeLeavePolicyStatus;
}

export interface EmployeeLeavePoliciesPage {
  items: EmployeeLeavePolicyType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface EmployeeLeavePoliciesResponse {
  results: EmployeeLeavePoliciesPage[];
}

export interface AssignLeavePolicyPayload {
  employeeId: number;
  policyId: number;
  effectiveDateType: EffectiveDateType;
  specificDate?: string;
}

export interface UnassignLeavePolicyPayload {
  employeeId: number;
  policyId: number;
}
