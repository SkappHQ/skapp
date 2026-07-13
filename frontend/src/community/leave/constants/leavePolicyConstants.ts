import {
  AccrualFrequency,
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyFormData
} from "~community/leave/types/LeavePolicyTypes";

export const MAX_POLICY_NAME_LENGTH = 100;

export const LEAVE_POLICY_PAGE_SIZE = 20;

export const LEAVE_POLICY_SEARCH_DEBOUNCE_MS = 500;

export const MAX_POLICY_DAYS = 365;

export const accrualFrequencyItemList = [
  { id: "daily", label: "Daily", value: AccrualFrequency.DAILY },
  { id: "weekly", label: "Weekly", value: AccrualFrequency.WEEKLY },
  {
    id: "every-other-week",
    label: "Every other week",
    value: AccrualFrequency.EVERY_OTHER_WEEK
  },
  {
    id: "twice-a-month",
    label: "Twice a month",
    value: AccrualFrequency.TWICE_A_MONTH
  },
  { id: "monthly", label: "Monthly", value: AccrualFrequency.MONTHLY },
  { id: "quarterly", label: "Quarterly", value: AccrualFrequency.QUARTERLY },
  {
    id: "twice-a-year",
    label: "Twice a year",
    value: AccrualFrequency.TWICE_A_YEAR
  },
  { id: "yearly", label: "Yearly", value: AccrualFrequency.YEARLY },
  {
    id: "on-anniversary",
    label: "On anniversary",
    value: AccrualFrequency.ON_ANNIVERSARY
  }
];

export const carryoverDateItemList = [
  { id: "january-1", label: "1st of January", value: "01-01" },
  { id: "april-1", label: "1st of April", value: "04-01" },
  { id: "july-1", label: "1st of July", value: "07-01" },
  { id: "october-1", label: "1st of October", value: "10-01" }
];

export const firstAccrualItemList = [
  {
    id: "prorated",
    label: "Prorated, based on the accrual period",
    value: FirstAccrualType.PRORATED
  },
  {
    id: "full",
    label: "Full amount regardless of start date",
    value: FirstAccrualType.FULL
  }
];

export const receiveAccruedTimeItemList = [
  {
    id: "start-of-period",
    label: "At the start of the accrual period",
    value: AccrualTiming.PERIOD_START
  },
  {
    id: "end-of-period",
    label: "At the end of the accrual period",
    value: AccrualTiming.PERIOD_END
  }
];

export const leavePolicyFormInitialValues: LeavePolicyFormData = {
  policyType: null,
  policyName: "",
  leaveType: "",
  leaveTypeName: "",
  accrualDays: "",
  accrualFrequency: "",
  hasWaitingPeriod: false,
  waitingPeriodDays: "",
  hasAccrualCap: false,
  accrualCapDays: "",
  canCarryOver: false,
  carryOverDate: "01-01",
  resetNegativeBalances: false,
  firstAccrual: FirstAccrualType.PRORATED,
  receiveAccruedTime: AccrualTiming.PERIOD_END,
  totalDaysAllocated: "",
  isCarryForwardEnabled: false,
  maxCarryForwardDays: "",
  carryForwardExpiryDate: undefined
};
