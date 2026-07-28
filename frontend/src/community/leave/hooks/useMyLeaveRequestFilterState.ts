import { useMemo } from "react";

import { useGetLeaveAllocation } from "~community/leave/api/MyRequestApi";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveAllocationDataTypes } from "~community/leave/types/MyRequests";

export interface LeaveTypeFilterOption {
  id: string;
  name: string;
}

interface AppliedFilters {
  status: string[];
  types: string[];
}

export const useMyLeaveRequestFilterState = () => {
  const selectedYear = useLeaveStore((state) => state.selectedYear);
  const leaveRequestsFilter = useLeaveStore(
    (state) => state.leaveRequestsFilter
  );
  const setLeaveRequestParams = useLeaveStore(
    (state) => state.setLeaveRequestParams
  );
  const setLeaveRequestsFilter = useLeaveStore(
    (state) => state.setLeaveRequestsFilter
  );
  const resetLeaveRequestParams = useLeaveStore(
    (state) => state.resetLeaveRequestParams
  );

  const { data: leaveAllocations } = useGetLeaveAllocation(selectedYear);

  const leaveTypeOptions: LeaveTypeFilterOption[] = useMemo(
    () =>
      (leaveAllocations ?? []).map((allocation: LeaveAllocationDataTypes) => ({
        id: String(allocation.leaveType.typeId),
        name: allocation.leaveType.name
      })),
    [leaveAllocations]
  );

  const appliedStatus = leaveRequestsFilter.status;
  const appliedTypes = leaveRequestsFilter.type;

  const filterCount = appliedStatus.length + appliedTypes.length;

  const applyFilters = ({ status, types }: AppliedFilters) => {
    setLeaveRequestParams("status", status);
    setLeaveRequestParams("leaveType", types);
    setLeaveRequestsFilter("status", status);
    setLeaveRequestsFilter("type", types);
  };

  return {
    leaveTypeOptions,
    appliedStatus,
    appliedTypes,
    filterCount,
    applyFilters,
    resetFilters: resetLeaveRequestParams
  };
};
