import {
  UseQueryOptions,
  UseQueryResult,
  useQuery
} from "@tanstack/react-query";

import { teamObjectivesApi } from "../api/TeamObjectivesApi";
import type { TeamObjectivesResponse } from "../types/ObjectiveTypes";

export const TEAM_OBJECTIVES_QUERY_KEY = "teamObjectives";

export const useTeamObjectives = (
  teamId: number,
  efffectiveTimePeriod: number,
  options?: Omit<
    UseQueryOptions<TeamObjectivesResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TeamObjectivesResponse, Error> => {
  return useQuery({
    queryKey: [TEAM_OBJECTIVES_QUERY_KEY, teamId, efffectiveTimePeriod],
    queryFn: () =>
      teamObjectivesApi.getTeamObjectives(teamId, efffectiveTimePeriod),
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options
  });
};
