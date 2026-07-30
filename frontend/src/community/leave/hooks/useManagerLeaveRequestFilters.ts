import { useMemo } from "react";

import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import {
  AppliedLeaveRequestFilters,
  LeaveTypeFilterOption
} from "~community/leave/utils/leaveRequest/leaveRequestFilterUtils";

export const useManagerLeaveRequestFilters = () => {
  const {
    leaveRequestsFilter,
    setLeaveRequestParams,
    setLeaveRequestsFilter,
    resetLeaveRequestParams
  } = useLeaveStore();

  const { data: leaveTypes } = useGetLeaveTypes();

  const leaveTypeOptions: LeaveTypeFilterOption[] = useMemo(
    () =>
      (leaveTypes ?? []).map((leaveType) => ({
        id: String(leaveType.typeId),
        name: leaveType.name
      })),
    [leaveTypes]
  );

  const appliedStatus = leaveRequestsFilter.status as LeaveStatusTypes[];
  const appliedTypes = leaveRequestsFilter.type;

  const applyFilters = ({
    status,
    leaveTypesIds
  }: AppliedLeaveRequestFilters) => {
    setLeaveRequestParams("status", status);
    setLeaveRequestParams("leaveType", leaveTypesIds);
    setLeaveRequestsFilter("status", status);
    setLeaveRequestsFilter("type", leaveTypesIds);
  };

  return {
    leaveTypeOptions,
    appliedStatus,
    appliedTypes,
    applyFilters,
    resetFilters: resetLeaveRequestParams
  };
};
