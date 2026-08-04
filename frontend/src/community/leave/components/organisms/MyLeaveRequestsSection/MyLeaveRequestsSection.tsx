import { FC, useEffect } from "react";

import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import PolicyLeaveRequests from "~community/leave/components/molecules/PolicyLeaveRequests/PolicyLeaveRequests";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";

/**
 * Single entry point for the My Requests table, mirroring how
 * `MyLeaveAllocationSection` switches the cards above it. Tenants on entitlements keep
 * the legacy table byte-for-byte; tenants on leave policies get the policy-scoped one.
 */
const MyLeaveRequestsSection: FC = () => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  const selectedYear = useLeaveStore((state) => state.selectedYear);
  const setPolicySelectedYear = usePolicyLeaveStore(
    (state) => state.setSelectedYear
  );

  useEffect(() => {
    if (selectedYear) {
      setPolicySelectedYear(selectedYear);
    }
  }, [selectedYear, setPolicySelectedYear]);

  // While the config resolves, render the legacy table's own loading path rather than
  // guessing — mounting the wrong table would fire a request the other tenant discards.
  if (isLoading) {
    return null;
  }

  return isLeavePoliciesEnabled ? <PolicyLeaveRequests /> : <LeaveRequests />;
};

export default MyLeaveRequestsSection;
