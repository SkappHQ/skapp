import { useLeaveStore } from "~community/leave/store/store";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

export const useAppliedLeaveRequestFilters = () => {
  const { leaveRequestsFilter } = useLeaveStore();

  // The store types status as string[], but only LeaveStatusTypes members are
  // ever written to it (seeded with PENDING, updated from the filter bodies).
  const appliedStatus = leaveRequestsFilter.status as LeaveStatusTypes[];
  const appliedTypes = leaveRequestsFilter.type;

  return {
    appliedStatus,
    appliedTypes,
    filterCount: appliedStatus.length + appliedTypes.length
  };
};
