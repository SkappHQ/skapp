import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

export const leaveStatusFilters: LeaveStatusTypes[] = [
  LeaveStatusTypes.PENDING,
  LeaveStatusTypes.APPROVED,
  LeaveStatusTypes.DENIED,
  LeaveStatusTypes.CANCELLED,
  LeaveStatusTypes.REVOKED
];

export interface LeaveTypeFilterOption {
  id: string;
  name: string;
}

export interface AppliedLeaveRequestFilters {
  status: LeaveStatusTypes[];
  leaveTypesIds: string[];
}

export const toggleFilterValue = <T>(
  selectedValues: T[],
  toggledValue: T
): T[] =>
  selectedValues.includes(toggledValue)
    ? selectedValues.filter((selectedValue) => selectedValue !== toggledValue)
    : [...selectedValues, toggledValue];
