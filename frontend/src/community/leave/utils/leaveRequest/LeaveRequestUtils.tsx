import { Start } from "@mui/icons-material";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import {
  getAsDaysString,
  getFormattedDate,
  getFormattedMonth,
  getFormattedYear
} from "~community/common/utils/dateTimeUtils";
import { LeaveState } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

export const leaveStatusIconSelector = (status: string): JSX.Element => {
  switch (status) {
    case LeaveStatusTypes.PENDING:
      return <Icon name={IconName.PENDING_STATUS_ICON} />;
    case LeaveStatusTypes.APPROVED:
      return <Icon name={IconName.APPROVED_STATUS_ICON} />;
    case LeaveStatusTypes.DENIED:
      return <Icon name={IconName.DENIED_STATUS_ICON} />;
    case LeaveStatusTypes.CANCELLED:
      return <Icon name={IconName.CANCELLED_STATUS_ICON} />;
    case LeaveStatusTypes.REVOKED:
      return <Icon name={IconName.REVOKED_STATUS_ICON} />;
    default:
      return <></>;
  }
};

export const getStartEndDate = (start: string, end: string): string => {
  if (start === end) {
    return `${getFormattedDate(start)} ${getFormattedMonth(start)} ${getFormattedYear(start)}`;
  }
  const startMonth = getFormattedMonth(start);
  const endMonth = getFormattedMonth(end);
  if (startMonth === endMonth) {
    return `${getFormattedDate(start)} to ${getFormattedDate(
      end
    )} ${getFormattedMonth(end)} ${getFormattedYear(end)}`;
  }
  return `${getFormattedDate(start)} ${getFormattedMonth(
    start
  )} ${getFormattedYear(start)} to ${getFormattedDate(end)} ${getFormattedMonth(end)} ${getFormattedYear(end)}`;
};

export const handleDurationDay = (
  days: number,
  leaveState: string,
  translateText: (keys: string[]) => string
) => {
  if (days >= 1) {
    return getAsDaysString(days.toString());
  } else if (leaveState === LeaveState.HALF_DAY_MORNING) {
    return translateText(["myLeaveRequests", "halfDayMorning"]);
  } else if (leaveState === LeaveState.HALF_DAY_EVENING) {
    return translateText(["myLeaveRequests", "halfDayEvening"]);
  }
};

export const handleLeaveStatus = (status: string): string => {
  switch (status) {
    case LeaveStatusTypes.PENDING:
      return "Pending";
    case LeaveStatusTypes.APPROVED:
      return "Approved";
    case LeaveStatusTypes.DENIED:
      return "Denied";
    case LeaveStatusTypes.CANCELLED:
      return "Cancelled";
    case LeaveStatusTypes.REVOKED:
      return "Revoked";
    default:
      return "";
  }
};

export const getLeaveRequestState = (
  leaveState: string,
  translateText: (keys: string[]) => string
) => {
  if (
    leaveState === LeaveState.HALF_DAY_MORNING ||
    leaveState === LeaveState.HALF_DAY_EVENING
  ) {
    return translateText(["halfDay"]);
  } else if (leaveState === LeaveState.FULL_DAY) {
    return translateText(["fullDay"]);
  } else {
    return "";
  }
};
