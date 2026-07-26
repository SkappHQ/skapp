/**
 * Single source of truth for whether the tenant-level "Leave Policies" feature is
 * enabled. The backend organization-config flag (ORGANIZATION_CONFIG: LEAVE_POLICY)
 * is not persisted yet, so this returns a constant for now. When the flag lands,
 * only this hook needs to change (read it from session/config here).
 */
const useIsLeavePoliciesEnabled = (): boolean => {
  return true;
};

export default useIsLeavePoliciesEnabled;
