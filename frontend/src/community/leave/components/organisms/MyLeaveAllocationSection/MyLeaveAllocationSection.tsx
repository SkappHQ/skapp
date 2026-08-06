import { Grid2 } from "@mui/material";
import { FC, useEffect } from "react";

import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import LeaveAllocationSkeleton from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocationSkeleton";
import LeavePolicyAllocation from "~community/leave/components/molecules/LeavePolicyAllocation/LeavePolicyAllocation";
import PolicyLeaveModalController from "~community/leave/components/organisms/PolicyLeaveModalController/PolicyLeaveModalController";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";

const MyLeaveAllocationSection: FC = () => {
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
