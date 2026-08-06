import { Grid2 } from "@mui/material";
import { FC, useEffect } from "react";

import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import LeaveAllocationSkeleton from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocationSkeleton";
import LeavePolicyAllocation from "~community/leave/components/molecules/LeavePolicyAllocation/LeavePolicyAllocation";
import PolicyLeaveModalController from "~community/leave/components/organisms/PolicyLeaveModalController/PolicyLeaveModalController";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";

/**
 * Single entry point for the My Leave Allocation section. Organizations on leave
 * policies get the per-policy cards and the policy-scoped apply flow; everyone else
 * keeps the existing entitlement cards untouched.
 */
const MyLeaveAllocationSection: FC = () => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  const selectedYear = useLeaveStore((state) => state.selectedYear);
  const setPolicySelectedYear = usePolicyLeaveStore(
    (state) => state.setSelectedYear
  );

  // Keep the policy flow on the same year the page's year dropdown is showing.
  useEffect(() => {
    if (selectedYear) {
      setPolicySelectedYear(selectedYear);
    }
  }, [selectedYear, setPolicySelectedYear]);

  // Render nothing concrete until the config resolves, otherwise a policy tenant would
  // briefly mount the legacy section and fire an entitlements request it will discard.
  if (isLoading) {
    return (
      <Grid2 container spacing={2}>
        <LeaveAllocationSkeleton />
      </Grid2>
    );
  }

  if (!isLeavePoliciesEnabled) {
    return <LeaveAllocation />;
  }

  return (
    <>
      <LeavePolicyAllocation />
      <PolicyLeaveModalController />
    </>
  );
};

export default MyLeaveAllocationSection;
