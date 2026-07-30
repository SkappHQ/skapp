// Mock: defaults to enabled until the backend LEAVE_POLICY org-config flag is persisted.
const useIsLeavePoliciesEnabled = (): boolean => {
  return true;
};

export default useIsLeavePoliciesEnabled;
