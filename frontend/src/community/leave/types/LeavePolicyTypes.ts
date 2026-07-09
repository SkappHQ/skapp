export enum LeavePolicyEntitlementType {
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

export interface LeavePolicyType {
  policyId: number;
  name: string;
  leaveTypeName: string;
  leaveTypeEmoji: string;
  entitlementType: LeavePolicyEntitlementType;
  status: LeavePolicyStatus;
  assignedEmployees: number;
}

export interface LeavePolicyFormData {
  entitlementType: LeavePolicyEntitlementType | null;
  policyName: string;
  leaveType: string;
  accrualDays: string;
  accrualFrequency: string;
  resetDate: string;
  hasWaitingPeriod: boolean;
  hasAccrualCap: boolean;
  canCarryOver: boolean;
  carryOverDate: Date | undefined;
  resetNegativeBalances: boolean;
  firstAccrual: string;
  receiveAccruedTime: string;
  totalDaysAllocated: string;
  isCarryForwardEnabled: boolean;
  maxCarryForwardDays: string;
  carryForwardExpiryDate: Date | undefined;
}
