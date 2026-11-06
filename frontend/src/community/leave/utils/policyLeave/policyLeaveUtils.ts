import { DateTime } from "luxon";
import { SetStateAction } from "react";

import { daysTypes } from "~community/common/constants/stringConstants";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { DayOfWeek } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import {
  FileUploadType,
  LeaveRequestStates
} from "~community/common/types/CommonTypes";
import { ToastProps } from "~community/common/types/ToastTypes";
import { getOrdinalIndicator } from "~community/common/utils/dateTimeUtils";
import { SUCCESS_TOAST_DURATION_MS } from "~community/leave/constants/stringConstants";
import {
  ApplyPolicyLeaveErrorKeys,
  LeaveStatusEnums
} from "~community/leave/enums/MyRequestEnums";
import {
  PolicyLeaveToastEnums,
  PolicyOnLeaveTodayStatus
} from "~community/leave/enums/PolicyLeaveEnums";
import {
  PolicyLeaveFormErrors,
  PolicyLeaveRequestParams,
  PolicyLeaveStore,
  initialPolicyLeaveFormErrors
} from "~community/leave/store/policyLeaveStore";
import {
  MyLeaveRequestPayloadType,
  ResourceAvailabilityPayload
} from "~community/leave/types/MyRequests";
import {
  EmployeePolicyBalanceType,
  PolicyBalanceDisabledReason,
  PolicyEmployeesOnLeaveType,
  PolicyLeaveRequestQueryParams,
  PolicyLeaveRequestStatus,
  PolicyLeaveRequestType,
  PolicyLeaveValidationFailure,
  PolicyResourceAvailabilityDayType,
  PolicyResourceAvailabilityEmployeeType,
  PolicyResourceAvailabilityLeaveRequestType
} from "~community/leave/types/PolicyLeaveTypes";
import {
  Employee,
  LeaveType,
  ResourceAvailabilityRecord
} from "~community/leave/types/ResourceAvailabilityTypes";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

export type TranslateFn = (
  key: string[],
  data?: Record<string, unknown>
) => string;

interface DisabledReasonToastKeys {
  titleKey: string[];
  descriptionKey: string[];
}

interface AvailabilityErrorMessageProps {
  failureReason: PolicyLeaveValidationFailure | null;
  remainingBalance: number;
  policyName: string;
  translateText: TranslateFn;
}

interface HandlePolicyLeaveToastProps {
  type: PolicyLeaveToastEnums;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: TranslateFn;
  key?: string;
}

interface PolicyLeaveToastConfig {
  toastType: ToastType;
  titleKey: string[];
  descriptionKey: string[];
  autoHideDuration?: number | null;
}

interface PolicyBalanceLabelProps {
  balanceInDays: number;
  isUnlimited: boolean;
  isBalanceAvailable: boolean;
  translateText: TranslateFn;
}

interface PolicyLeaveFormErrorsProps {
  selectedDatesLength: number;
  comment: string;
  attachments: FileUploadType[];
  policyBalance: EmployeePolicyBalanceType | null;
  availabilityError: string;
  translateText: TranslateFn;
}

const BALANCE_UNAVAILABLE_LABEL = "—";

export const policyLeaveStatusFilters: PolicyLeaveRequestStatus[] = [
  PolicyLeaveRequestStatus.PENDING,
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveRequestStatus.REVOKED
];

export const getDisabledReasonToastKeys = (
  reason: PolicyBalanceDisabledReason | null
): DisabledReasonToastKeys => {
  switch (reason) {
    case PolicyBalanceDisabledReason.ALLOCATION_PERIOD_EXPIRED:
      return {
        titleKey: ["expiredError", "title"],
        descriptionKey: ["expiredError", "description"]
      };
    case PolicyBalanceDisabledReason.NO_SUPERVISOR_ASSIGNED:
      return {
        titleKey: ["noSupervisorError", "title"],
        descriptionKey: ["noSupervisorError", "description"]
      };
    case PolicyBalanceDisabledReason.POLICY_INACTIVE:
      return {
        titleKey: ["policyInactiveError", "title"],
        descriptionKey: ["policyInactiveError", "description"]
      };
    case PolicyBalanceDisabledReason.FULLY_UTILIZED:
      return {
        titleKey: ["fullyUtilizedError", "title"],
        descriptionKey: ["fullyUtilizedError", "description"]
      };
    default:
      return {
        titleKey: ["balanceUnavailableError", "title"],
        descriptionKey: ["balanceUnavailableError", "description"]
      };
  }
};

export const getPolicyBalanceLabel = ({
  balanceInDays,
  isUnlimited,
  isBalanceAvailable,
  translateText
}: PolicyBalanceLabelProps): string => {
  if (!isBalanceAvailable) {
    return BALANCE_UNAVAILABLE_LABEL;
  }

  return isUnlimited ? translateText(["unlimited"]) : balanceInDays.toString();
};

export const toLeaveStatus = (
  status: PolicyLeaveRequestStatus
): LeaveStatusEnums | null => {
  switch (status) {
    case PolicyLeaveRequestStatus.PENDING:
      return LeaveStatusEnums.PENDING;
    case PolicyLeaveRequestStatus.APPROVED:
      return LeaveStatusEnums.APPROVED;
    default:
      return null;
  }
};

export const uniqueByLeaveRequestId = (
  requests: PolicyLeaveRequestType[]
): PolicyLeaveRequestType[] =>
  Array.from(
    new Map(
      requests.map((request) => [request.leaveRequestId, request])
    ).values()
  );

export const toMyLeaveRequestPayloads = (
  requests: PolicyLeaveRequestType[]
): MyLeaveRequestPayloadType[] =>
  requests.flatMap((request) => {
    const status = toLeaveStatus(request.status);

    if (!status) {
      return [];
    }

    return [
      {
        leaveRequestId: request.leaveRequestId,
        startDate: request.startDate,
        endDate: request.endDate,
        leaveType: {
          typeId: request.leaveType.id,
          name: request.leaveType.name,
          emojiCode: request.leaveType.emojiCode,
          colorCode: request.leaveType.colorCode
        },
        leaveState: request.leaveState,
        status,
        isViewed: request.isViewed,
        durationDays: request.durationDays,
        requestDesc: request.requestDesc ?? ""
      }
    ];
  });

export const getAvailabilityErrorMessage = ({
  failureReason,
  remainingBalance,
  policyName,
  translateText
}: AvailabilityErrorMessageProps): string => {
  switch (failureReason) {
    case PolicyLeaveValidationFailure.INSUFFICIENT_BALANCE:
      return translateText(["errors", "insufficientBalance"], {
        days: remainingBalance,
        policyName
      });
    case PolicyLeaveValidationFailure.OUTSIDE_POLICY_PERIOD:
      return translateText(["errors", "outsidePolicyPeriod"], { policyName });
    case PolicyLeaveValidationFailure.OVERLAPPING_REQUEST:
      return translateText(["errors", "overlappingRequest"]);
    case PolicyLeaveValidationFailure.NO_WORKING_DAYS:
      return translateText(["errors", "noWorkingDays"]);
    case PolicyLeaveValidationFailure.INVALID_DATE_RANGE:
      return translateText(["errors", "invalidDateRange"]);
    default:
      return "";
  }
};

export const mapApplyErrorKeyToToastType = (
  messageKey: string
): PolicyLeaveToastEnums => {
  switch (messageKey) {
    case ApplyPolicyLeaveErrorKeys.POLICY_NOT_ASSIGNED:
      return PolicyLeaveToastEnums.POLICY_NOT_ASSIGNED;
    case ApplyPolicyLeaveErrorKeys.INSUFFICIENT_BALANCE:
      return PolicyLeaveToastEnums.INSUFFICIENT_BALANCE;
    case ApplyPolicyLeaveErrorKeys.NOT_APPLICABLE:
      return PolicyLeaveToastEnums.NOT_APPLICABLE;
    case ApplyPolicyLeaveErrorKeys.REQUEST_OVERLAP:
      return PolicyLeaveToastEnums.REQUEST_OVERLAP;
    case ApplyPolicyLeaveErrorKeys.OUTSIDE_POLICY_PERIOD:
      return PolicyLeaveToastEnums.OUTSIDE_POLICY_PERIOD;
    default:
      return PolicyLeaveToastEnums.APPLY_ERROR;
  }
};

export const handlePolicyLeaveToast = ({
  type,
  setToastMessage,
  translateText,
  key
}: HandlePolicyLeaveToastProps): void => {
  const toastConfig: Record<PolicyLeaveToastEnums, PolicyLeaveToastConfig> = {
    [PolicyLeaveToastEnums.APPLY_SUCCESS]: {
      toastType: ToastType.SUCCESS,
      titleKey: ["toastMessages", "applySuccess", "title"],
      descriptionKey: ["toastMessages", "applySuccess", "description"],
      autoHideDuration: SUCCESS_TOAST_DURATION_MS
    },
    [PolicyLeaveToastEnums.APPLY_ERROR]: {
      toastType: ToastType.ERROR,
      titleKey: ["toastMessages", "applyError", "title"],
      descriptionKey: ["toastMessages", "applyError", "description"]
    },
    [PolicyLeaveToastEnums.POLICY_NOT_ASSIGNED]: {
      toastType: ToastType.ERROR,
      titleKey: ["toastMessages", "policyNotAssigned", "title"],
      descriptionKey: ["toastMessages", "policyNotAssigned", "description"]
    },
    [PolicyLeaveToastEnums.INSUFFICIENT_BALANCE]: {
      toastType: ToastType.ERROR,
      titleKey: ["toastMessages", "insufficientBalance", "title"],
      descriptionKey: ["toastMessages", "insufficientBalance", "description"]
    },
    [PolicyLeaveToastEnums.NOT_APPLICABLE]: {
      toastType: ToastType.ERROR,
      titleKey: ["toastMessages", "notApplicable", "title"],
      descriptionKey: ["toastMessages", "notApplicable", "description"]
    },
    [PolicyLeaveToastEnums.REQUEST_OVERLAP]: {
      toastType: ToastType.ERROR,
      titleKey: ["toastMessages", "requestOverlap", "title"],
      descriptionKey: ["toastMessages", "requestOverlap", "description"]
    },
    [PolicyLeaveToastEnums.OUTSIDE_POLICY_PERIOD]: {
      toastType: ToastType.ERROR,
      titleKey: ["toastMessages", "outsidePolicyPeriod", "title"],
      descriptionKey: ["toastMessages", "outsidePolicyPeriod", "description"]
    }
  };

  const config = toastConfig[type];

  setToastMessage({
    key,
    open: true,
    toastType: config.toastType,
    title: translateText(config.titleKey),
    description: translateText(config.descriptionKey),
    autoHideDuration:
      config.autoHideDuration ??
      (config.toastType === ToastType.ERROR ? null : undefined)
  });
};

export const getPolicyLeaveFormErrors = ({
  selectedDatesLength,
  comment,
  attachments,
  policyBalance,
  availabilityError,
  translateText
}: PolicyLeaveFormErrorsProps): PolicyLeaveFormErrors => {
  const errors: PolicyLeaveFormErrors = { ...initialPolicyLeaveFormErrors };

  if (selectedDatesLength === 0) {
    errors.selectedDates = translateText(["errors", "datesRequired"]);
  } else if (availabilityError) {
    errors.selectedDates = availabilityError;
  }

  if (policyBalance?.leaveType?.isCommentMust && !comment.trim()) {
    errors.comment = translateText(["errors", "commentRequired"]);
  }

  if (policyBalance?.leaveType?.isAttachmentMust && attachments.length === 0) {
    errors.attachment = translateText(["errors", "attachmentRequired"]);
  }

  return errors;
};

export const hasPolicyLeaveFormErrors = (
  errors: PolicyLeaveFormErrors
): boolean => Object.values(errors).some((error) => error !== "");

export const selectHasUnsavedChanges = (state: PolicyLeaveStore): boolean =>
  state.selectedDates.length > 0 ||
  state.comment.trim() !== "" ||
  state.attachments.length > 0;

export const getPolicyLeaveRequestQueryParams = (
  year: string,
  params: PolicyLeaveRequestParams
): PolicyLeaveRequestQueryParams => {
  const { status, policyId, ...rest } = params;

  return {
    ...rest,
    year,
    status: status.length ? status.join(",") : undefined,
    policyId: policyId.length ? policyId.join(",") : undefined
  };
};

export const getPolicyOnLeaveTodayStatus = (
  onLeaveToday: PolicyEmployeesOnLeaveType
): PolicyOnLeaveTodayStatus => {
  if (onLeaveToday.isNonWorkingDay) {
    return PolicyOnLeaveTodayStatus.NON_WORKING_DAY;
  }

  const onLeaveCount = onLeaveToday.onLeaveCount ?? 0;
  const onlineCount = onLeaveToday.onlineCount ?? 0;

  if (onLeaveCount === 0 && onlineCount === 0) {
    return PolicyOnLeaveTodayStatus.NO_EMPLOYEES;
  }
  if (onLeaveCount === 0) {
    return PolicyOnLeaveTodayStatus.ALL_AVAILABLE;
  }
  if (onlineCount === 0) {
    return PolicyOnLeaveTodayStatus.ALL_AWAY;
  }
  return PolicyOnLeaveTodayStatus.PARTIALLY_AWAY;
};

export const getResourceAvailabilityCalendarRange = (
  year: number,
  month: number
): { startDate: string; endDate: string } => {
  const firstOfMonth = DateTime.local(year, month, 1);

  return {
    startDate: firstOfMonth.startOf("week").toFormat(DATE_FORMAT),
    endDate: firstOfMonth.endOf("month").endOf("week").toFormat(DATE_FORMAT)
  };
};

const getWorkingResourceAvailabilityDays = (
  days: PolicyResourceAvailabilityDayType[],
  workingDays: daysTypes[]
): PolicyResourceAvailabilityDayType[] => {
  if (!workingDays.length) return days;
  return days.filter((day) => workingDays.includes(day.dayOfWeek));
};

const toResourceAvailabilityDateLabel = (date: string): string => {
  const dateTime = DateTime.fromISO(date).setLocale("en");
  return `${dateTime.day}${getOrdinalIndicator(dateTime.day)} ${dateTime.toFormat("LLL")}`.toUpperCase();
};

const RESOURCE_AVAILABILITY_DAY_OF_WEEK: Record<daysTypes, DayOfWeek> = {
  [daysTypes.MONDAY]: DayOfWeek.MON,
  [daysTypes.TUESDAY]: DayOfWeek.TUE,
  [daysTypes.WEDNESDAY]: DayOfWeek.WED,
  [daysTypes.THURSDAY]: DayOfWeek.THU,
  [daysTypes.FRIDAY]: DayOfWeek.FRI,
  [daysTypes.SATURDAY]: DayOfWeek.SAT,
  [daysTypes.SUNDAY]: DayOfWeek.SUN
};

const toResourceAvailabilityDayOfWeek = (dayOfWeek: daysTypes): DayOfWeek =>
  RESOURCE_AVAILABILITY_DAY_OF_WEEK[dayOfWeek];

const toResourceAvailabilityLeaveType = (
  leaveRequest: PolicyResourceAvailabilityLeaveRequestType
): LeaveType => ({
  typeId: leaveRequest.leaveType.id,
  name: leaveRequest.policyName,
  emojiCode: leaveRequest.leaveType.emojiCode,
  colorCode: leaveRequest.leaveType.colorCode
});

const toResourceAvailabilityEmployee = (
  employee: PolicyResourceAvailabilityEmployeeType
): Employee => ({
  employeeId: employee.employeeId,
  firstName: employee.firstName,
  middleName: employee.middleName,
  lastName: employee.lastName,
  authPic: employee.authPic ?? ""
});

export const toResourceAvailabilityRecords = (
  days: PolicyResourceAvailabilityDayType[],
  workingDays: daysTypes[]
): ResourceAvailabilityRecord[] =>
  getWorkingResourceAvailabilityDays(days, workingDays).map((day) => ({
    date: toResourceAvailabilityDateLabel(day.date),
    actualDate: day.date,
    dayOfWeek: toResourceAvailabilityDayOfWeek(day.dayOfWeek),
    leaveCount: day.leaveCount,
    availableCount: day.availableCount,
    holidays: day.holidays.map((holiday) => ({
      id: String(holiday.id ?? ""),
      name: holiday.name,
      holidayDuration: holiday.holidayDuration
    })),
    leaveRequests: day.leaveRequests.map((leaveRequest) => ({
      leaveRequestId: leaveRequest.leaveRequestId,
      leaveState: leaveRequest.leaveState,
      status: LeaveRequestStates.APPROVED,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      leaveType: toResourceAvailabilityLeaveType(leaveRequest),
      employee: toResourceAvailabilityEmployee(leaveRequest.employee),
      reviewer: leaveRequest.reviewer
        ? toResourceAvailabilityEmployee(leaveRequest.reviewer)
        : null
    }))
  }));

export const toResourceAvailabilityPayloads = (
  days: PolicyResourceAvailabilityDayType[],
  workingDays: daysTypes[]
): ResourceAvailabilityPayload[] =>
  getWorkingResourceAvailabilityDays(days, workingDays).map((day) => ({
    date: toResourceAvailabilityDateLabel(day.date),
    dayOfWeek: toResourceAvailabilityDayOfWeek(day.dayOfWeek),
    leaveCount: day.leaveCount,
    availableCount: day.availableCount,
    holidays: day.holidays.map((holiday) => ({
      id: holiday.id ?? 0,
      name: holiday.name,
      holidayDuration: holiday.holidayDuration ?? HolidayDurationType.NONE
    })),
    leaveRequests: day.leaveRequests.map((leaveRequest) => ({
      leaveRequestId: leaveRequest.leaveRequestId,
      leaveState: leaveRequest.leaveState,
      status: LeaveStatusEnums.APPROVED,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      leaveType: toResourceAvailabilityLeaveType(leaveRequest),
      reviewer: leaveRequest.reviewer
        ? {
            employeeId: leaveRequest.reviewer.employeeId,
            firstName: leaveRequest.reviewer.firstName,
            middleName: leaveRequest.reviewer.middleName ?? "",
            lastName: leaveRequest.reviewer.lastName,
            authPic: leaveRequest.reviewer.authPic ?? ""
          }
        : null,
      employee: {
        employeeId: leaveRequest.employee.employeeId,
        firstName: leaveRequest.employee.firstName,
        middleName: leaveRequest.employee.middleName ?? "",
        lastName: leaveRequest.employee.lastName,
        authPic: leaveRequest.employee.authPic ?? ""
      }
    }))
  }));
