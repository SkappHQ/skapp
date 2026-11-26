import useCanViewLeavePolicies from "~community/leave/hooks/useCanViewLeavePolicies";

const useCanAssignLeavePolicies = (): boolean => useCanViewLeavePolicies();

export default useCanAssignLeavePolicies;
