import { FC, useState } from "react";

import { getDateForPeriod } from "~community/common/utils/dateTimeUtils";
import {
  useGetTeamLeaveHistory,
  useGetTeamLeaveTrendForYear
} from "~community/leave/api/TeamLeaveAnalyticApi";
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

  const { data: leaveTrendData, isLoading: isTrendPending } =
    useGetTeamLeaveTrendForYear(
      Number(teamId),
      getDateForPeriod("year", "start"),
      getDateForPeriod("year", "end")
    );

  const { data: teamDetails } = useGetTeamDetailsById(Number(teamId));

  return (
    <>
      <LeaveAnalyticsTrendForYear
        data={leaveTrendData}
        isLoading={isTrendPending}
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
