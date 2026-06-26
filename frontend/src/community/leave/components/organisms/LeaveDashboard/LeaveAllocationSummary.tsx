import { JSX } from "react";

import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import EmployeeLeaveStatusPopupController from "~community/leave/components/organisms/EmployeeLeaveStatusPopupController/EmployeeLeaveStatusPopupController";

const LeaveAllocationSummary = (): JSX.Element => {
  return (
    <>
      <LeaveAllocation />
      <LeaveRequests />
      <EmployeeLeaveStatusPopupController />
    </>
  );
};

export default LeaveAllocationSummary;
