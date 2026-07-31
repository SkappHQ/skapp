import { IS_LEAVE_POLICIES_ENABLED_MOCK } from "~community/leave/constants/policyLeaveTypeConstants";

/**
 * Tells the UI whether the leave policy feature has been enabled for the
 * organization. When enabled, leave types are managed through the new policy
 * leave type endpoints; when disabled, the legacy leave type flow is used.
 *
 * TODO: replace the mocked constant with the real organization config query
 * (`GET /v1/leave/policies/config`) once it is available.
 */
const useIsLeavePoliciesEnabled = (): boolean => {
  return IS_LEAVE_POLICIES_ENABLED_MOCK;
};

export default useIsLeavePoliciesEnabled;
