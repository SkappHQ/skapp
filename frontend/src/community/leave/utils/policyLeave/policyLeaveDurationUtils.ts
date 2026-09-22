import { LeaveStates } from "~community/common/types/CommonTypes";
import { TranslateFn } from "~community/leave/utils/policyLeave/policyLeaveUtils";

export const getPolicyLeaveDurationLabel = (
  durationDays: number,
  leaveState: LeaveStates,
  translateText: TranslateFn,
  daysLabel: string
): string => {
  if (durationDays > 1) {
    return `${durationDays} ${daysLabel}`;
  }

  if (leaveState === LeaveStates.MORNING) {
    return translateText(["myRequests", "myLeaveRequests", "halfDayMorning"]);
  }

  if (leaveState === LeaveStates.EVENING) {
    return translateText(["myRequests", "myLeaveRequests", "halfDayEvening"]);
  }

  return translateText(["myRequests", "myLeaveRequests", "fullDay"]);
};
