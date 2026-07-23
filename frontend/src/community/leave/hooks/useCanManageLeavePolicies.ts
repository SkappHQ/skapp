import useSessionData from "~community/common/hooks/useSessionData";

const useCanManageLeavePolicies = (): boolean => {
  const { isSuperAdmin, isLeaveAdmin } = useSessionData();

  return Boolean(isSuperAdmin || isLeaveAdmin);
};

export default useCanManageLeavePolicies;
