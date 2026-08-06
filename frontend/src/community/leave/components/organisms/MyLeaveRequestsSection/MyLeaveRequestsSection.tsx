import { FC, useEffect } from "react";

import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import PolicyLeaveRequests from "~community/leave/components/molecules/PolicyLeaveRequests/PolicyLeaveRequests";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";

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

  if (isLoading) {
    return null;
  }

  return isLeavePoliciesEnabled ? <PolicyLeaveRequests /> : <LeaveRequests />;
};

export default MyLeaveRequestsSection;
