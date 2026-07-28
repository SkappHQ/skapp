import { useMemo } from "react";

import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import { useAppliedLeaveRequestFilters } from "~community/leave/hooks/useAppliedLeaveRequestFilters";
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
  const {
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

  const { appliedStatus, appliedTypes } = useAppliedLeaveRequestFilters();

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
    applyFilters,
    resetFilters: resetLeaveRequestParams
  };
};
