import { BulkStatusSummary } from "~community/common/types/BulkUploadTypes";

export enum PolicyType {
  ACCRUAL = "ACCRUAL",
  FLEXIBLE = "FLEXIBLE"
}

export interface BulkAssignPolicyRow {
  employeeName: string;
  policyName: string;
  effectiveDate: string;
}

export interface BulkAssignPolicyPayload {
  assignments: BulkAssignPolicyRow[];
}

export interface BulkAssignPolicyErrorLog extends BulkAssignPolicyRow {
  error: string;
}

export interface BulkAssignPolicyResponse {
  bulkStatusSummary: BulkStatusSummary;
  bulkRecordErrorLogs: BulkAssignPolicyErrorLog[];
}

export interface BulkAssignPolicyApiResponse {
  results: BulkAssignPolicyResponse[];
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
