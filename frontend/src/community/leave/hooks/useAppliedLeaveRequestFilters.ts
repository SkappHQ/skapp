import { useLeaveStore } from "~community/leave/store/store";

/**
 * Store-only view of the applied leave request filters. Components that just
 * need the applied values (e.g. the filter button badge count) should use this
 * instead of the full filter state hooks, which also fetch leave types.
 */
export const useAppliedLeaveRequestFilters = () => {
  const { leaveRequestsFilter } = useLeaveStore();

  const appliedStatus = leaveRequestsFilter.status;
  const appliedTypes = leaveRequestsFilter.type;

  return {
    appliedStatus,
    appliedTypes,
    filterCount: appliedStatus.length + appliedTypes.length
  };
};
