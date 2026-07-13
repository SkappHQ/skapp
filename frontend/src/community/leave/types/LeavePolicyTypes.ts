export enum PolicyType {
  ACCRUAL = "ACCRUAL",
  FIXED = "FIXED"
}

export enum LeavePolicyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum LeavePolicyWizardSteps {
  BASIC_INFO = 0,
  ENTITLEMENT_SETUP = 1,
  CARRY_FORWARD = 2,
  SUMMARY = 3
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
  leaveTypeName: string;
  leaveTypeEmoji: string;
  policyType: PolicyType;
  status: LeavePolicyStatus;
  assignedEmployees: number;
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
  resetNegativeBalances: boolean;
  firstAccrual: string;
  receiveAccruedTime: string;
  totalDaysAllocated: string;
  isCarryForwardEnabled: boolean;
  maxCarryForwardDays: string;
  carryForwardExpiryDate: Date | undefined;
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
  resetNegativeOnCarryover: boolean;
  firstAccrual: string;
  accrualTiming: string;
}

export interface AddLeavePolicyPayload {
  name: string;
  leaveTypeId: number;
  policyType: PolicyType;
  fixedDaysAllocated?: number;
  carryForwardEnabled: boolean;
  maxCarryForwardDays?: number;
  carryForwardExpiryDate?: string;
  accrual?: AddLeavePolicyAccrualPayload;
}
