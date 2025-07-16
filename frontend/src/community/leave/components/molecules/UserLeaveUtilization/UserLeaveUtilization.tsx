import { FC, useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { GetLeaveUtilizationChartDetails } from "~community/leave/api/LeaveAnalyticsApi";
import LeaveTypeBreakdownChart from "~community/leave/components/molecules/LeaveUtilizationGraph/LeaveTypeBreakdownChart";
import { LeaveType } from "~community/leave/types/CustomLeaveAllocationTypes";
import chartDataSetMockData from "~enterprise/leave/data/chartDataSetMockData.json";

interface Props {
  employeeId: number;
  leaveTypesList: LeaveType[];
}

const UserLeaveUtilization: FC<Props> = ({ employeeId, leaveTypesList }) => {
  const { isProTier } = useSessionData();

  const {
    isLoading,
    error,
    data: datasetData
  } = GetLeaveUtilizationChartDetails(
    employeeId,
    leaveTypesList as unknown as LeaveType[],
    isProTier
  );

  const datasets = useMemo(() => {
    return isProTier ? datasetData : chartDataSetMockData;
  }, [isProTier, datasetData]);

  return (
    <LeaveTypeBreakdownChart
      datasets={datasets}
      isLoading={isLoading}
      error={error}
      isUserProfileView={true}
    />
  );
};

export default UserLeaveUtilization;
