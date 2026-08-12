import { LeaveStates } from "~community/common/types/CommonTypes";
import { TranslateFn } from "~community/leave/utils/policyLeave/policyLeaveUtils";

/**
 * Mirrors the legacy `leaveRequestDataPreProcessor` duration label: a day count once the
 * request is longer than a day, and the leave state otherwise.
 */
export const getPolicyLeaveDurationLabel = (
  durationDays: number,
  leaveState: LeaveStates,
  translateText: TranslateFn,
  translateCommonText: TranslateFn
): string => {
  if (durationDays > 1) {
    return `${durationDays} ${translateCommonText(["days"])}`;
  }

  if (leaveState === LeaveStates.MORNING) {
    return translateText(["myLeaveRequests", "halfDayMorning"]);
  }

  if (leaveState === LeaveStates.EVENING) {
    return translateText(["myLeaveRequests", "halfDayEvening"]);
  }

  return translateText(["myLeaveRequests", "fullDay"]);
};
