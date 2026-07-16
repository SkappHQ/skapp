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
  policyId: number;
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

export interface PolicyLeaveTypeType {
  typeId: number;
  name: string;
  emojiCode: string | null;
  colorCode: string | null;
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
  resetNegativeBalances: boolean;
  firstAccrual: string;
  receiveAccruedTime: string;
}

export type LeavePolicyWizardErrors = Partial<
  Record<keyof LeavePolicyFormData, string>
>;

export interface AddLeavePolicyAccrualPayload {
  accrualDays: number;
  frequency: string;
  waitingPeriodDays?: number;
  accrualCapDays?: number;
  carryoverEnabled: boolean;
  carryoverDate?: string;
  maxCarryoverDays?: number;
  resetNegativeBalancesOnCarryover?: boolean;
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
