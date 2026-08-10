import { Grid2 } from "@mui/material";
import { FC } from "react";

import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import LeaveAllocationSkeleton from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocationSkeleton";
import LeavePolicyAllocation from "~community/leave/components/molecules/LeavePolicyAllocation/LeavePolicyAllocation";
import PolicyLeaveModalController from "~community/leave/components/organisms/PolicyLeaveModalController/PolicyLeaveModalController";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import usePolicyLeaveYearSync from "~community/leave/hooks/usePolicyLeaveYearSync";

const MyLeaveAllocationSection: FC = () => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  usePolicyLeaveYearSync();

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
