import {
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyFormData
} from "~community/leave/types/LeavePolicyTypes";

export const MAX_POLICY_NAME_LENGTH = 100;

export const ACCRUAL_PREVIEW_ROW_LIMIT = 4;

export const LEAVE_POLICY_PAGE_SIZE = 10;

export const USER_ASSIGNED_LEAVE_TYPES_PAGE_SIZE = 8;

export const LEAVE_POLICY_SEARCH_DEBOUNCE_MS = 500;

export const MAX_POLICY_DAYS = 365;

export const MIN_POLICY_DAYS = 0.5;

export const POLICY_DAYS_STEP = 0.5;

export const MIN_ACCRUAL_CAP_DAYS = 1;

export const MIN_WAITING_PERIOD_DAYS = 1;

export const MAX_BULK_ASSIGN_ROWS = 1000;

export const CSV_DELIMITER = ",";

export const CARRYOVER_EXPIRY_DATE_FORMAT = "MM-dd";

export const CARRYOVER_EXPIRY_REFERENCE_YEAR = 2025;

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
  carryoverExpiryDate: "",
  maxCarryOverDays: "",
  firstAccrual: FirstAccrualType.PRORATED,
  receiveAccruedTime: AccrualTiming.PERIOD_END
};
