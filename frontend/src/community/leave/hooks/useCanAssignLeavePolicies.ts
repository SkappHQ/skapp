import useSessionData from "~community/common/hooks/useSessionData";

const useCanAssignLeavePolicies = (): boolean => {
  const { isSuperAdmin, isLeaveAdmin, isPeopleAdmin } = useSessionData();

  return Boolean(isSuperAdmin || isLeaveAdmin || isPeopleAdmin);
};

export default useCanAssignLeavePolicies;
