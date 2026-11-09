import { FC, useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { GetLeaveUtilizationChartDetails } from "~community/leave/api/LeaveAnalyticsApi";
import { useGetPolicyEmployeeLeaveUtilization } from "~community/leave/api/PolicyLeaveApi";
import LeaveTypeBreakdownChart from "~community/leave/components/molecules/LeaveUtilizationGraph/LeaveTypeBreakdownChart";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { LeaveType } from "~community/leave/types/CustomLeaveAllocationTypes";
import { getPolicyLeaveUtilizationSource } from "~community/leave/utils/policyLeave/policyLeaveUtils";
import chartDataSetMockData from "~enterprise/leave/data/chartDataSetMockData.json";

interface Props {
  employeeId: number;
  leaveTypesList: LeaveType[];
}

const UserLeaveUtilization: FC<Props> = ({ employeeId, leaveTypesList }) => {
  const { isProTier } = useSessionData();

  const { isLeavePoliciesEnabled, isLoading: isLeavePolicyConfigLoading } =
    useLeavePoliciesEnabled();

  const { isLegacyEnabled, isPolicyEnabled } = getPolicyLeaveUtilizationSource({
    isProTier,
    isLeavePoliciesEnabled,
    isLeavePolicyConfigLoading
  });

  const legacyUtilization = GetLeaveUtilizationChartDetails(
    employeeId,
    leaveTypesList,
    isLegacyEnabled
  );

  const policyUtilization = useGetPolicyEmployeeLeaveUtilization(
    employeeId,
    isPolicyEnabled
  );

  const {
    isLoading,
    error,
    data: datasetData
  } = isPolicyEnabled ? policyUtilization : legacyUtilization;

  const datasets = useMemo(() => {
    return isProTier ? datasetData : chartDataSetMockData;
  }, [isProTier, datasetData]);

  return (
    <LeaveTypeBreakdownChart
      datasets={datasets}
      isLoading={isLoading || (isProTier && isLeavePolicyConfigLoading)}
      error={error}
      isUserProfileView={true}
    />
  );
};

export default UserLeaveUtilization;
