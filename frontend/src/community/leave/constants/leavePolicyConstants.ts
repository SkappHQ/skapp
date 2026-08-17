import { DurationLike } from "luxon";

import {
  AccrualFrequency,
  AccrualTiming,
  CalendarUnit,
  FirstAccrualType,
  LeavePolicyFormData
} from "~community/leave/types/LeavePolicyTypes";

export const MAX_POLICY_NAME_LENGTH = 100;

export const ACCRUAL_PREVIEW_ROW_LIMIT = 12;

export const CALENDAR_UNIT: Partial<Record<AccrualFrequency, CalendarUnit>> = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  QUARTERLY: "quarter",
  YEARLY: "year",
  ON_ANNIVERSARY: "year"
};

export const INTERVAL_STEP: Partial<Record<AccrualFrequency, DurationLike>> = {
  EVERY_OTHER_WEEK: { weeks: 2 },
  TWICE_A_MONTH: { days: 15 },
  TWICE_A_YEAR: { months: 6 }
};

export const LEAVE_POLICY_PAGE_SIZE = 10;

export const LEAVE_POLICY_SKELETON_ROW_COUNT = 8;

export const LEAVE_POLICY_SEARCH_DEBOUNCE_MS = 500;

export const MAX_POLICY_DAYS = 365;

export const MIN_POLICY_DAYS = 0.5;

export const MIN_ACCRUAL_CAP_DAYS = 1;

export const MIN_WAITING_PERIOD_DAYS = 1;

export const accrualFrequencyItemList = [
  { id: "daily", labelKey: "daily", value: AccrualFrequency.DAILY },
  { id: "weekly", labelKey: "weekly", value: AccrualFrequency.WEEKLY },
  {
    id: "every-other-week",
    labelKey: "everyOtherWeek",
    value: AccrualFrequency.EVERY_OTHER_WEEK
  },
  {
    id: "twice-a-month",
    labelKey: "twiceAMonth",
    value: AccrualFrequency.TWICE_A_MONTH
  },
  { id: "monthly", labelKey: "monthly", value: AccrualFrequency.MONTHLY },
  { id: "quarterly", labelKey: "quarterly", value: AccrualFrequency.QUARTERLY },
  {
    id: "twice-a-year",
    labelKey: "twiceAYear",
    value: AccrualFrequency.TWICE_A_YEAR
  },
  { id: "yearly", labelKey: "yearly", value: AccrualFrequency.YEARLY },
  {
    id: "on-anniversary",
    labelKey: "onAnniversary",
    value: AccrualFrequency.ON_ANNIVERSARY
  }
];

export const CARRYOVER_EXPIRY_DATE_FORMAT = "MM-dd";

export const CARRYOVER_EXPIRY_DISPLAY_FORMAT = "dd MMMM";

export const CARRYOVER_EXPIRY_REFERENCE_YEAR = 2024;

export const firstAccrualItemList = [
  {
    id: "prorated",
    labelKey: "prorated",
    value: FirstAccrualType.PRORATED
  },
  {
    id: "full",
    labelKey: "full",
    value: FirstAccrualType.FULL
  }
];

export const receiveAccruedTimeItemList = [
  {
    id: "start-of-period",
    labelKey: "startOfPeriod",
    value: AccrualTiming.PERIOD_START
  },
  {
    id: "end-of-period",
    labelKey: "endOfPeriod",
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
  carryoverExpiryDate: "",
  maxCarryOverDays: "",
  firstAccrual: FirstAccrualType.PRORATED,
  receiveAccruedTime: AccrualTiming.PERIOD_END
};
