import { FC, useState } from "react";

import { getDateForPeriod } from "~community/common/utils/dateTimeUtils";
import { useGetPolicyTeamLeaveTrend } from "~community/leave/api/PolicyLeaveApi";
import {
  useGetTeamLeaveHistory,
  useGetTeamLeaveTrendForYear
} from "~community/leave/api/TeamLeaveAnalyticApi";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { SelectedFiltersTypes } from "~community/leave/types/TeamLeaveAnalyticsTypes";
import { useGetTeamDetailsById } from "~community/people/api/TeamApi";

import TeamAnalyticsLeaveHistoryTable from "../../molecules/TeamAnalyticsLeaveHistoryTable/TeamAnalyticsLeaveHistoryTable";
import LeaveAnalyticsTrendForYear from "../LeaveAnalyticsTrendForYear/LeaveAnalyticsTrendForYear";

interface Props {
  teamId: number;
}

const TeamLeaveAnalyticsContent: FC<Props> = ({ teamId }) => {
  const [chartFilters, setChartFilters] = useState<SelectedFiltersTypes>({});
  const { data: leaveHistoryData, isLoading: isHistoryPending } =
    useGetTeamLeaveHistory(Number(teamId));

  const { isLeavePoliciesEnabled, isLoading: isPolicyConfigLoading } =
    useLeavePoliciesEnabled();

  const {
    data: legacyLeaveTrendData,
    isLoading: isLegacyTrendPending,
    error: legacyLeaveTrendError
  } = useGetTeamLeaveTrendForYear(
    Number(teamId),
    getDateForPeriod("year", "start"),
    getDateForPeriod("year", "end"),
    !isPolicyConfigLoading && !isLeavePoliciesEnabled
  );

  const {
    data: policyLeaveTrendData,
    isLoading: isPolicyTrendPending,
    error: policyLeaveTrendError
  } = useGetPolicyTeamLeaveTrend(
    teamId,
    !isPolicyConfigLoading && isLeavePoliciesEnabled
  );

  const leaveTrendData = isLeavePoliciesEnabled
    ? policyLeaveTrendData
    : legacyLeaveTrendData;

  const leaveTrendError = isLeavePoliciesEnabled
    ? policyLeaveTrendError
    : legacyLeaveTrendError;

  const isTrendPending =
    isPolicyConfigLoading ||
    (isLeavePoliciesEnabled ? isPolicyTrendPending : isLegacyTrendPending);

  const { data: teamDetails } = useGetTeamDetailsById(Number(teamId));

  return (
    <>
      <LeaveAnalyticsTrendForYear
        data={leaveTrendData}
        isLoading={isTrendPending}
        error={leaveTrendError}
        chartFilters={chartFilters}
        setChartFilters={setChartFilters}
      />
      <TeamAnalyticsLeaveHistoryTable
        leaveHistory={leaveHistoryData}
        currentPage={leaveHistoryData?.currentPage}
        isLoading={isHistoryPending}
        teamDetails={teamDetails?.employees}
      />
    </>
  );
};
export default TeamLeaveAnalyticsContent;
