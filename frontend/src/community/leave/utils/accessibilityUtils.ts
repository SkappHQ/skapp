import {
  formatDateWithOrdinalSuffix,
  getAsDaysString
} from "~community/common/utils/dateTimeUtils";
import { LeaveEntitlementBalanceType } from "~community/leave/types/LeaveEntitlementTypes";

import { getStartEndDate } from "./leaveRequest/LeaveRequestUtils";

// Returns: "Available 10 / 20, Effective from 1st January 2025, Expired to 31st December 2025"
export const createLeaveEntitlementAccessibleDescription = (
  leaveEntitlementBalance: LeaveEntitlementBalanceType[] | undefined,
  translateText: (keys: string[]) => string | undefined
): string | undefined => {
  const availableLabel = translateText(["available"]);
  const effectiveFromLabel = translateText(["effectiveFrom"]);
  const expiredToLabel = translateText(["expiredTo"]);

  const descriptions = leaveEntitlementBalance
    ?.map((entitlement) => {
      const available =
        entitlement.totalDaysAllocated - entitlement.totalDaysUsed;
      const total = entitlement.totalDaysAllocated;
      const validFrom = formatDateWithOrdinalSuffix(entitlement.validFrom);
      const validTo = formatDateWithOrdinalSuffix(entitlement.validTo);

      return `${availableLabel} ${available} / ${total}, ${effectiveFromLabel} ${validFrom}, ${expiredToLabel} ${validTo}`;
    })
    .join(". ");

  return descriptions;
};

//Returns: "Full Day leave request record for the 16th Jul of the leave type Annual and the current status of the request is pending. Click to open modal"
export const generateMyLeaveRequestAriaLabel = (
  translateAria: (path: string[], params?: Record<string, any>) => string,
  translateText: (path: string[], params?: Record<string, any>) => string,
  employeeLeaveRequest: {
    durationDays: number;
    startDate: string;
    endDate: string;
    leaveType?: { name: string };
    status: string;
  }
): string => {
  return translateAria(["myLeaveRequests", "leaveRecordRow"], {
    duration:
      employeeLeaveRequest.durationDays == 1
        ? translateText(["myLeaveRequests", "fullDay"])
        : employeeLeaveRequest.durationDays < 1
          ? translateText(["myLeaveRequests", "halfDay"])
          : getAsDaysString(employeeLeaveRequest.durationDays),
    date: getStartEndDate(
      employeeLeaveRequest.startDate,
      employeeLeaveRequest.endDate
    ),
    leaveType: employeeLeaveRequest?.leaveType?.name,
    leaveStatus: employeeLeaveRequest?.status.toLowerCase()
  });
};

//Returns: "Leave request record for John Smith, 1 Day leave on 30th Jun for Annual leave, current status is pending. Click to open modal"
export const generateManagerLeaveRequestAriaLabel = (
  translateAria: (path: string[], params?: Record<string, any>) => string,
  employeeLeaveRequest: {
    employee?: { firstName?: string | null; lastName?: string | null };
    durationDays?: number | string | null;
    leaveRequestDates?: string | null;
    leaveType?: { name?: string | null; emojiCode?: string | null };
    status: string;
  }
): string => {
  return translateAria(["leaveRecordRow"], {
    name: `${employeeLeaveRequest?.employee?.firstName || ""} ${employeeLeaveRequest?.employee?.lastName || ""}`,
    duration: getAsDaysString(employeeLeaveRequest?.durationDays ?? ""),
    date: employeeLeaveRequest?.leaveRequestDates || "",
    leaveType: employeeLeaveRequest?.leaveType?.name || "",
    leaveStatus: employeeLeaveRequest?.status.toLowerCase()
  });
};
