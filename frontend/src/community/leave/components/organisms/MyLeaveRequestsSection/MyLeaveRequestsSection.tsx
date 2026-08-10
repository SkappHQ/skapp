import { FC } from "react";

import TableSkeleton from "~community/common/components/molecules/Table/TableSkeleton";
import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import PolicyLeaveRequests from "~community/leave/components/molecules/PolicyLeaveRequests/PolicyLeaveRequests";
import { LEAVE_REQUESTS_SKELETON_ROWS } from "~community/leave/constants/stringConstants";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import usePolicyLeaveYearSync from "~community/leave/hooks/usePolicyLeaveYearSync";

const MyLeaveRequestsSection: FC = () => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  usePolicyLeaveYearSync();

  if (isLoading) {
    return <TableSkeleton rows={LEAVE_REQUESTS_SKELETON_ROWS} />;
  }

  return isLeavePoliciesEnabled ? <PolicyLeaveRequests /> : <LeaveRequests />;
};

export default MyLeaveRequestsSection;
