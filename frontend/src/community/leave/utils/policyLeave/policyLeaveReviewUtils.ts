import { DAY_MONTH_YEAR_FORMAT } from "~community/attendance/constants/constants";
import { formatInstant } from "~community/common/utils/dateTimeUtils";
import { EmployeeLeaveRequestType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import {
  PolicyLeaveReviewEmployeeType,
  PolicyLeaveReviewRequestParams,
  PolicyManagerLeaveRequestQueryParams
} from "~community/leave/types/PolicyLeaveReviewTypes";

export const getPolicyManagerLeaveRequestQueryParams = (
  params: PolicyLeaveReviewRequestParams
): PolicyManagerLeaveRequestQueryParams => {
  const { status, leaveTypeId, startDate, endDate, ...rest } = params;

  return {
    ...rest,
    status: status.length ? status.join(",") : undefined,
    leaveTypeId: leaveTypeId.length ? leaveTypeId.join(",") : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  };
};

export const formatOptionalDate = (
  value: string | null,
  zone: string | undefined
): string => {
  if (!value) return "";

  return formatInstant(value, zone, DAY_MONTH_YEAR_FORMAT);
};

/** StatusPopupRow types the reviewer with a non nullable avatar. */
export const toStatusPopupReviewer = (
  reviewer: PolicyLeaveReviewEmployeeType | null
): EmployeeLeaveRequestType | undefined =>
  reviewer
    ? {
        employeeId: reviewer.employeeId,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        middleName: reviewer.middleName,
        authPic: reviewer.authPic ?? ""
      }
    : undefined;
