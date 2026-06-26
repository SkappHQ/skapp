import { useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import { LeaveTrendForYearPreProcessor } from "../actions/LeaveTrendPreProcessor";
import { useLeaveStore } from "../store/store";
import { analyticAPIs } from "./utils/ApiEndpoints";
import { leaveQueryKeys } from "./utils/QueryKeys";

export const useGetTeamLeaveHistory = (teamId: number) => {
  const params = useLeaveStore((state) => state.teamLeaveAnalyticParams);

  return useQuery({
    queryKey: [leaveQueryKeys.TEAM_LEAVE_HISTORY, teamId, params],
    queryFn: async () => {
      const url = analyticAPIs.TEAM_LEAVE_HISTORY(teamId);
      const response = await authFetch.get(url, { params });
      return response;
    },
    select: (response) => {
      return response?.data?.results[0];
    }
  });
};

export const useGetTeamLeaveTrendForYear = (
  teamId: number,
  startDate: string,
  endDate: string
) => {
  const params = {
    startDate,
    endDate,
    teamId,
    leaveTypeIds: "-1" //* we used -1 for get all team information
  };

  return useQuery({
    queryKey: [leaveQueryKeys.TEAM_LEAVE_TREND_FOR_YEAR, teamId, params],
    queryFn: async () => {
      const url = analyticAPIs.TEAM_LEAVE_TREND_FOR_YEAR();
      const response = await authFetch.get(url, { params });
      return response;
    },
    select: (response) => {
      return LeaveTrendForYearPreProcessor(response?.data);
    }
  });
};
