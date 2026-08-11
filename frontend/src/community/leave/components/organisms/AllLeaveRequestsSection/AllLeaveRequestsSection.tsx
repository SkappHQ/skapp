import { FC } from "react";

import TableSkeleton from "~community/common/components/molecules/Table/TableSkeleton";
import LeaveRequestEmployeeTeamSearch from "~community/leave/components/molecules/LeaveRequestEmployeeTeamSearch/LeaveRequestEmployeeTeamSearch";
import PolicyManagerLeaveRequests from "~community/leave/components/molecules/PolicyManagerLeaveRequests/PolicyManagerLeaveRequests";
import LegacyAllLeaveRequests from "~community/leave/components/organisms/LegacyAllLeaveRequests/LegacyAllLeaveRequests";
import PolicyLeaveReviewModalController from "~community/leave/components/organisms/PolicyLeaveReviewModalController/PolicyLeaveReviewModalController";
import { LEAVE_REQUESTS_SKELETON_ROWS } from "~community/leave/constants/stringConstants";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";

const AllLeaveRequestsSection: FC = () => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  if (isLoading) {
    return <TableSkeleton rows={LEAVE_REQUESTS_SKELETON_ROWS} />;
  }

  if (isLeavePoliciesEnabled) {
    return (
      <>
        <LeaveRequestEmployeeTeamSearch />
        <PolicyManagerLeaveRequests />
        <PolicyLeaveReviewModalController />
      </>
    );
  }

  return <LegacyAllLeaveRequests />;
};

export default AllLeaveRequestsSection;
