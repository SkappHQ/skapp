import { FC, useEffect } from "react";

import { useGetManagerAssignedLeaveRequests } from "~community/leave/api/LeaveApi";
import LeaveRequestEmployeeTeamSearch from "~community/leave/components/molecules/LeaveRequestEmployeeTeamSearch/LeaveRequestEmployeeTeamSearch";
import ManagerLeaveRequest from "~community/leave/components/molecules/ManagerLeaveRequests/ManagerLeaveRequest";
import LeaveManagerModalController from "~community/leave/components/organisms/LeaveManagerModalController/LeaveManagerModalController";
import { useLeaveStore } from "~community/leave/store/store";

const LegacyAllLeaveRequests: FC = () => {
  const { data: assignedLeaveRequests, isLoading } =
    useGetManagerAssignedLeaveRequests();

  const { setLeaveRequestParams } = useLeaveStore((state) => state);

  useEffect(() => {
    setLeaveRequestParams("status", ["PENDING"]);
  }, [setLeaveRequestParams]);

  return (
    <>
      <LeaveRequestEmployeeTeamSearch />

      <ManagerLeaveRequest
        employeeLeaveRequests={assignedLeaveRequests?.items ?? []}
        totalPages={assignedLeaveRequests?.totalPages}
        isLoading={isLoading}
      />

      <LeaveManagerModalController />
    </>
  );
};

export default LegacyAllLeaveRequests;
