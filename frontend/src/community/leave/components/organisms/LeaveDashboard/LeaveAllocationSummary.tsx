import { JSX } from "react";

import EmployeeLeaveStatusPopupController from "~community/leave/components/organisms/EmployeeLeaveStatusPopupController/EmployeeLeaveStatusPopupController";
import MyLeaveAllocationSection from "~community/leave/components/organisms/MyLeaveAllocationSection/MyLeaveAllocationSection";
import MyLeaveRequestsSection from "~community/leave/components/organisms/MyLeaveRequestsSection/MyLeaveRequestsSection";

const LeaveAllocationSummary = (): JSX.Element => {
  return (
    <>
      <MyLeaveAllocationSection />
      <MyLeaveRequestsSection />
      <EmployeeLeaveStatusPopupController />
    </>
  );
};

export default LeaveAllocationSummary;
