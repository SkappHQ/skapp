import { FC } from "react";

import TableSkeleton from "~community/common/components/molecules/Table/TableSkeleton";
import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import PolicyLeaveRequests from "~community/leave/components/molecules/PolicyLeaveRequests/PolicyLeaveRequests";
import PolicyEmployeeLeaveStatusPopupController from "~community/leave/components/organisms/PolicyEmployeeLeaveStatusPopupController/PolicyEmployeeLeaveStatusPopupController";
import { LEAVE_REQUESTS_SKELETON_ROWS } from "~community/leave/constants/stringConstants";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";

const MyLeaveRequestsSection: FC = () => {
  const { isLeavePoliciesEnabled, isLoading } = useLeavePoliciesEnabled();

  if (isLoading) {
    return <TableSkeleton rows={LEAVE_REQUESTS_SKELETON_ROWS} />;
  }

  if (isLeavePoliciesEnabled) {
    return (
      <>
        <PolicyLeaveRequests />
        <PolicyEmployeeLeaveStatusPopupController />
      </>
    );
  }

  return <LeaveRequests />;
};

export default MyLeaveRequestsSection;
