import useSessionData from "~community/common/hooks/useSessionData";

// Individual assign and unassign; bulk assign stays with useCanManageLeavePolicies.
const useCanAssignLeavePolicies = (): boolean => {
  const { isSuperAdmin, isLeaveAdmin, isPeopleAdmin } = useSessionData();

  return Boolean(isSuperAdmin || isLeaveAdmin || isPeopleAdmin);
};

export default useCanAssignLeavePolicies;
