import authFetch from "~community/common/utils/axiosInterceptor";

import type { TeamObjectivesResponse } from "../types/ObjectiveTypes";
import { teamObjectivesEndpoints } from "./utils/ApiEndpoints";

export const teamObjectivesApi = {
  getTeamObjectives: async (
    teamId: number,
    effectiveTimePeriod: number
  ): Promise<TeamObjectivesResponse> => {
    const url = teamObjectivesEndpoints.GET_TEAM_OBJECTIVES();
    const { data } = await authFetch.get(url, {
      params: {
        teamId,
        effectiveTimePeriod
      }
    });

    return data;
  }
};
