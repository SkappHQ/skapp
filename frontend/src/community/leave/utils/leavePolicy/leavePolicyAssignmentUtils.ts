import {
  EmployeeLeavePolicyType,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";


export const findSupersededAssignment = (
  assignments: EmployeeLeavePolicyType[],
  selectedPolicy: LeavePolicyType
): EmployeeLeavePolicyType | undefined =>
  assignments.find(
    (assignment) =>
      assignment.leaveTypeId === selectedPolicy.leaveTypeId &&
      assignment.policyId !== selectedPolicy.id
  );
