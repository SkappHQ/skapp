import { useMemo } from "react";

import { useGetLeaveAllocation } from "~community/leave/api/MyRequestApi";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import { LeaveAllocationDataTypes } from "~community/leave/types/MyRequests";
import {
  AppliedLeaveRequestFilters,
  LeaveTypeFilterOption
} from "~community/leave/utils/leaveRequest/leaveRequestFilterUtils";

export const useMyLeaveRequestFilters = () => {
  const {
    selectedYear,
    leaveRequestsFilter,
    setLeaveRequestParams,
    setLeaveRequestsFilter,
    resetLeaveRequestParams
  } = useLeaveStore();

  const { data: leaveAllocations } = useGetLeaveAllocation(selectedYear);

  const leaveTypeOptions: LeaveTypeFilterOption[] = useMemo(
    () =>
      (leaveAllocations ?? []).map((allocation: LeaveAllocationDataTypes) => ({
        id: String(allocation.leaveType.typeId),
        name: allocation.leaveType.name
      })),
    [leaveAllocations]
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
