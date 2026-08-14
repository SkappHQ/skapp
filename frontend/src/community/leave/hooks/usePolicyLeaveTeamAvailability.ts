import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { getMonthStartAndEndDates } from "~community/common/utils/dateTimeUtils";
import { useGetResourceAvailability } from "~community/leave/api/MyRequestApi";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { ResourceAvailabilityPayload } from "~community/leave/types/MyRequests";
import { useGetMyTeams } from "~community/people/api/TeamApi";
import { TeamNamesType } from "~community/people/types/TeamTypes";

interface PolicyLeaveTeamAvailability {
  myTeams: TeamNamesType[] | undefined;
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
}

const usePolicyLeaveTeamAvailability = (): PolicyLeaveTeamAvailability => {
  const { selectedMonth, selectedTeam, setSelectedTeam } = usePolicyLeaveStore(
    useShallow((state) => ({
      selectedMonth: state.selectedMonth,
      selectedTeam: state.selectedTeam,
      setSelectedTeam: state.setSelectedTeam
    }))
  );

  const { data: myTeams } = useGetMyTeams();

  useEffect(() => {
    if (!selectedTeam && myTeams && myTeams.length > 0) {
      setSelectedTeam(myTeams[0] ?? null);
    }
  }, [myTeams, selectedTeam, setSelectedTeam]);

  const startAndEndDates = useMemo(
    () => getMonthStartAndEndDates(selectedMonth),
    [selectedMonth]
  );

  const { data: resourceAvailability } = useGetResourceAvailability({
    teams: selectedTeam !== null ? (selectedTeam.teamId as number) : null,
    startDate: startAndEndDates.start,
    endDate: startAndEndDates.end
  });

  return { myTeams, resourceAvailability };
};

export default usePolicyLeaveTeamAvailability;
