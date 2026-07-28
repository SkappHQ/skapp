import { useMemo } from "react";

import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";

export interface LeaveTypeFilterOption {
  id: string;
  name: string;
}

interface AppliedFilters {
  status: string[];
  types: string[];
}

export const useManagerLeaveRequestFilterState = () => {
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

  const { data: leaveTypes } = useGetLeaveTypes();

  const leaveTypeOptions: LeaveTypeFilterOption[] = useMemo(
    () =>
      (leaveTypes ?? []).map((leaveType) => ({
        id: String(leaveType.typeId),
        name: leaveType.name
      })),
    [leaveTypes]
  );

  const appliedStatus = leaveRequestsFilter.status;
  const appliedTypes = leaveRequestsFilter.type;

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
    filterCount: appliedStatus.length + appliedTypes.length,
    applyFilters,
    resetFilters: resetLeaveRequestParams
  };
};
