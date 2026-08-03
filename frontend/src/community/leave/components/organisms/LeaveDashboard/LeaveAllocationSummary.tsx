import { JSX } from "react";

import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import EmployeeLeaveStatusPopupController from "~community/leave/components/organisms/EmployeeLeaveStatusPopupController/EmployeeLeaveStatusPopupController";
import MyLeaveAllocationSection from "~community/leave/components/organisms/MyLeaveAllocationSection/MyLeaveAllocationSection";

const LeaveAllocationSummary = (): JSX.Element => {
  return (
    <>
      <MyLeaveAllocationSection />
      <LeaveRequests />
      <EmployeeLeaveStatusPopupController />
    </>
  );
};

export default LeaveAllocationSummary;
