import { FC } from "react";

import TableSkeleton from "~community/common/components/molecules/Table/TableSkeleton";
import PendingLeaveRequestTable from "~community/leave/components/molecules/PendingLeaveRequestTable/PendingLeaveRequestTable";
import PolicyPendingLeaveRequests from "~community/leave/components/molecules/PolicyPendingLeaveRequests/PolicyPendingLeaveRequests";
import { LEAVE_REQUESTS_SKELETON_ROWS } from "~community/leave/constants/stringConstants";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";

interface Props {
  searchTerm?: string;
}

const PendingLeaveRequestsSection: FC<Props> = ({ searchTerm }) => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  if (isLoading) {
    return <TableSkeleton rows={LEAVE_REQUESTS_SKELETON_ROWS} />;
  }

  if (isLeavePoliciesEnabled) {
    return <PolicyPendingLeaveRequests searchTerm={searchTerm} />;
  }

  return <PendingLeaveRequestTable searchTerm={searchTerm} />;
};

export default PendingLeaveRequestsSection;
