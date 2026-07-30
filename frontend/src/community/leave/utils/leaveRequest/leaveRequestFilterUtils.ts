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
  leaveTypesIds: LeaveTypeFilterOption["id"][];
}

export const toggleFilterValue = <T>(values: T[], value: T): T[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
