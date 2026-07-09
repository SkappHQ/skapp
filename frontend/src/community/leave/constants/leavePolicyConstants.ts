import {
  LeavePolicyEntitlementType,
  LeavePolicyFormData,
  LeavePolicyStatus,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";

export const leavePolicyMockData: LeavePolicyType[] = [
  {
    policyId: 1,
    name: "Annual Leave Policy",
    leaveTypeName: "Annual",
    leaveTypeEmoji: "🌴",
    entitlementType: LeavePolicyEntitlementType.ACCRUAL,
    status: LeavePolicyStatus.ACTIVE,
    assignedEmployees: 42
  },
  {
    policyId: 2,
    name: "Sick Leave Policy",
    leaveTypeName: "Sick",
    leaveTypeEmoji: "🌡️",
    entitlementType: LeavePolicyEntitlementType.FIXED,
    status: LeavePolicyStatus.ACTIVE,
    assignedEmployees: 38
  },
  {
    policyId: 3,
    name: "Casual Leave Policy",
    leaveTypeName: "Casual",
    leaveTypeEmoji: "👋",
    entitlementType: LeavePolicyEntitlementType.ACCRUAL,
    status: LeavePolicyStatus.ACTIVE,
    assignedEmployees: 27
  },
  {
    policyId: 4,
    name: "Senior Annual Leave",
    leaveTypeName: "Annual",
    leaveTypeEmoji: "🌴",
    entitlementType: LeavePolicyEntitlementType.FIXED,
    status: LeavePolicyStatus.ACTIVE,
    assignedEmployees: 15
  },
  {
    policyId: 5,
    name: "Junior Sick Leave",
    leaveTypeName: "Sick",
    leaveTypeEmoji: "🌡️",
    entitlementType: LeavePolicyEntitlementType.FIXED,
    status: LeavePolicyStatus.INACTIVE,
    assignedEmployees: 6
  },
  {
    policyId: 6,
    name: "Trial Casual Leave",
    leaveTypeName: "Casual",
    leaveTypeEmoji: "👋",
    entitlementType: LeavePolicyEntitlementType.FIXED,
    status: LeavePolicyStatus.ACTIVE,
    assignedEmployees: 11
  },
  {
    policyId: 7,
    name: "Unpaid Leave Policy",
    leaveTypeName: "Unpaid",
    leaveTypeEmoji: "🚫",
    entitlementType: LeavePolicyEntitlementType.FIXED,
    status: LeavePolicyStatus.INACTIVE,
    assignedEmployees: 0
  }
];

export const leaveTypeItemList = [
  { id: "annual", label: "🌴 Annual", value: "Annual" },
  { id: "sick", label: "🌡️ Sick", value: "Sick" },
  { id: "casual", label: "👋 Casual", value: "Casual" },
  { id: "unpaid", label: "🚫 Unpaid", value: "Unpaid" }
];

export const accrualFrequencyItemList = [
  { id: "monthly", label: "Monthly", value: "Monthly" },
  { id: "quarterly", label: "Quarterly", value: "Quarterly" },
  { id: "semi-annually", label: "Semi-annually", value: "Semi-annually" },
  { id: "annually", label: "Annually", value: "Annually" }
];

export const resetDateItemList = [
  { id: "january-1", label: "January 1", value: "January 1" },
  { id: "april-1", label: "April 1", value: "April 1" },
  { id: "july-1", label: "July 1", value: "July 1" },
  { id: "october-1", label: "October 1", value: "October 1" }
];

export const firstAccrualItemList = [
  {
    id: "prorated",
    label: "Prorated, based on the accrual period",
    value: "Prorated, based on the accrual period"
  },
  {
    id: "full",
    label: "Full accrual amount",
    value: "Full accrual amount"
  }
];

export const receiveAccruedTimeItemList = [
  {
    id: "end-of-period",
    label: "At the end of the accrual period",
    value: "At the end of the accrual period"
  },
  {
    id: "start-of-period",
    label: "At the start of the accrual period",
    value: "At the start of the accrual period"
  }
];

export const leavePolicyFormInitialValues: LeavePolicyFormData = {
  entitlementType: null,
  policyName: "",
  leaveType: "",
  accrualDays: "",
  accrualFrequency: "",
  resetDate: "",
  hasWaitingPeriod: false,
  hasAccrualCap: false,
  canCarryOver: false,
  carryOverDate: undefined,
  resetNegativeBalances: false,
  firstAccrual: "Prorated, based on the accrual period",
  receiveAccruedTime: "At the end of the accrual period",
  totalDaysAllocated: "",
  isCarryForwardEnabled: false,
  maxCarryForwardDays: "",
  carryForwardExpiryDate: undefined
};
