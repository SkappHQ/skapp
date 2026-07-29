import { DateTime } from "luxon";
import { DateTime as dt } from "luxon-business-days";

import {
  getFormattedDate,
  getFormattedMonth,
  getStandardDate
} from "~community/common/utils/dateTimeUtils";

import {
  LeaveStatusTypes,
  SingleLeaveRequestItemType,
  leaveRequestRowDataTypes
} from "../types/LeaveRequestTypes";

export const getStartEndDate = (start: string, end: string): string => {
  if (start === end) {
    return `${getFormattedDate(start)} ${getFormattedMonth(start)}`;
  }
  const startMonth = getFormattedMonth(start);
  const endMonth = getFormattedMonth(end);
  if (startMonth === endMonth) {
    return `${getFormattedDate(start)} to ${getFormattedDate(
      end
    )} ${getFormattedMonth(end)}`;
  }
  return `${getFormattedDate(start)} ${getFormattedMonth(
    start
  )} to ${getFormattedDate(end)} ${getFormattedMonth(end)}`;
};

export function getLeaveRequestStatus(status: string): LeaveStatusTypes | "" {
  switch (status) {
    case LeaveStatusTypes.APPROVED.toUpperCase():
      return (status = LeaveStatusTypes.APPROVED);
    case LeaveStatusTypes.CANCELLED.toUpperCase():
      return (status = LeaveStatusTypes.CANCELLED);
    case LeaveStatusTypes.DENIED.toUpperCase():
      return (status = LeaveStatusTypes.DENIED);
    case LeaveStatusTypes.PENDING.toUpperCase():
      return (status = LeaveStatusTypes.PENDING);
    case LeaveStatusTypes.REVOKED.toUpperCase():
      return (status = LeaveStatusTypes.REVOKED);
    case LeaveStatusTypes.SUPERVISOR_NUDGED.toUpperCase():
      return (status = LeaveStatusTypes.SUPERVISOR_NUDGED);
    default:
      return "";
  }
}

export function getLeaveRequestsLeaveState(
  start: string,
  end: string,
  leaveState: string
): string {
  const startDate = DateTime?.fromISO(start);
  const endDate = DateTime?.fromISO(end);
  const { days } =
    endDate?.diff(startDate, ["months", "days"]).toObject() || {};

  if (days && days > 0) {
    const duration = calculateDuration(start, end);
    return `${parseInt(duration as unknown as string)} Days`;
  } else {
    if (leaveState === "HALFDAY_MORNING") {
      return "Half Day - Morning";
    } else if (leaveState === "HALFDAY_EVENING") {
      return "Half Day - Evening";
    } else if (leaveState === "FULLDAY") {
      return "Full Day";
    } else {
      return "";
    }
  }
}

export const calculateDuration = (
  startDate: string,
  endDate: string
): number => {
  if (
    startDate !== "" &&
    startDate !== undefined &&
    endDate !== "" &&
    endDate !== undefined
  ) {
    const dateFormate1 = new Date(startDate);
    const dateFormate2 = new Date(endDate);

    const end = dt.fromISO(dateFormate2.toISOString());
    let start = dt.fromISO(dateFormate1.toISOString());
    let count: number = 1;

    while (end > start) {
      count++;
      start = start.plusBusiness();
    }
    return count;
  }

  return 0;
};

export function leaveRequestDataPreProcessor(
  data: SingleLeaveRequestItemType
): leaveRequestRowDataTypes {
  return {
    leaveId: data.leaveRequestId,
    empId: data?.employee?.employeeId as number,
    empName: data?.employee?.firstName ?? "",
    lastName: data?.employee?.lastName ?? "",
    avatarUrl: data?.employee?.authPic ?? "",
    durationDays: data?.durationDays,
    dates: getStartEndDate(data.startDate, data.endDate),
    days:
      (Number(data?.durationDays) || 0) > 1
        ? data?.durationDays
        : getLeaveRequestsLeaveState(
            data.startDate,
            data.endDate,
            data.leaveState
          ),
    reason: data?.requestDesc ?? "",
    reviewerComment: data?.reviewerComment ?? "",
    reviewedDate: getStandardDate(data?.reviewedDate),
    status: getLeaveRequestStatus(data?.status),
    leaveType: data?.leaveType?.name || "",
    leaveEmoji: data?.leaveType?.emojiCode ?? "",
    startDate: data?.startDate,
    endDate: data?.endDate,
    creationDate: getStandardDate(data?.creationDate),
    reviewer: data?.reviewer,
    attachments: data?.attachments,
    managerType: data?.managerType
  };
}

export const validateDescription = (desc: string): boolean => {
  if (desc.trim().length === 0 || desc.trim().length > 255) {
    return true;
  }
  return false;
};

export const getPercentage = (total: number, part: number) => {
  if (total && total > 0) {
    return ((total - part) / total) * 100;
  } else {
    return 0;
  }
};
