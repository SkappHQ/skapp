import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { teamEndpoints } from "~community/people/api/utils/ApiEndpoints";
import {
  managerQueryKeys,
  teamQueryKeys
} from "~community/people/api/utils/QueryKeys";
import {
  AddTeamType,
  GetManagerTeamsResponseType,
  TeamNamesType,
  TeamResponseType,
  TeamType,
  UpdateTeamType
} from "~community/people/types/TeamTypes";
import { quickSetupQueryKeys } from "~enterprise/common/api/utils/QueryKeys";

export const useGetAllTeams = (): UseQueryResult<TeamType[]> => {
  return useQuery({
    queryKey: teamQueryKeys.ALL_TEAMS,
    queryFn: () => authFetch.get(teamEndpoints.TEAMS),
    select: (data) => {
      return data?.data?.results?.map((team: TeamResponseType) => {
        const supervisors = team?.employees
          ?.filter((employee) => employee?.isSupervisor)
          .map((employee) => employee?.employee);

        const teamMembers = team?.employees
          ?.filter((employee) => !employee?.isSupervisor)
          .map((employee) => employee?.employee);

        return {
          teamId: team?.teamId,
          teamName: team?.teamName,
          supervisors: supervisors,
          teamMembers: teamMembers
        };
      });
    }
  });
};

export const useCreateTeam = (
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamData: AddTeamType) => {
      const formattedTeamData = {
        teamName: teamData?.teamName,
        teamMembers: teamData?.teamMembers?.map((member) => member?.employeeId),
        teamSupervisors: teamData?.teamSupervisors?.map(
          (member) => member?.employeeId
        )
      };
      return authFetch.post(teamEndpoints.TEAMS, formattedTeamData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.ALL_TEAMS
      });
      queryClient.invalidateQueries({
        queryKey: quickSetupQueryKeys.QUICK_SETUP_PROGRESS
      });
      onSuccess();
    },
    onError
  });
};

export const useUpdateTeam = (
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: UpdateTeamType) => {
      const formattedTeamData = {
        teamName: teamData?.teamName,
        teamMembers: teamData?.teamMembers?.map((member) => member?.employeeId),
        teamSupervisors: teamData?.teamSupervisors?.map(
          (member) => member?.employeeId
        )
      };
      return authFetch.patch(
        teamEndpoints.UPDATE_TEAM(teamData?.teamId),
        formattedTeamData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.ALL_TEAMS
      });
      onSuccess();
    },
    onError
  });
};

export const useGetAllManagerTeams =
  (): UseQueryResult<GetManagerTeamsResponseType> => {
    return useQuery({
      queryKey: managerQueryKeys.managerAllTeams,
      queryFn: async () => {
        const url = teamEndpoints.MANAGER_ALL_TEAMS;
        const response: any = await authFetch.get(url);
        const responseData = response?.data?.results;
        return {
          managerTeams: responseData
        };
      }
    });
  };

export const useGetMyTeams = (): UseQueryResult<TeamNamesType[]> => {
  return useQuery({
    queryKey: teamQueryKeys.MY_TEAMS,
    queryFn: async () => await authFetch.get(teamEndpoints.MY_TEAMS),
    select: (data) => {
      return data?.data?.results?.sort((a: TeamNamesType, b: TeamNamesType) =>
        a.teamName.localeCompare(b.teamName)
      );
    }
  });
};

const transferMembers = (transferDetails: {
  teamId: string;
  transferMembers: Array<{ employeeId: number; teamId: number }>;
}) =>
  authFetch.patch(
    teamEndpoints.TRANSFER_TEAM(transferDetails.teamId),
    transferDetails.transferMembers
  );

export const useTransferTeamMembers = (
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamQueryKeys.ALL_TEAMS
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      if (onError) onError(error);
    }
  });
};

export const useGetTeamDetailsById = (teamId: number) => {
  return useQuery({
    queryKey: [teamQueryKeys.GET_TEAM_BY_ID, teamId],
    queryFn: async () => {
      const response = await authFetch.get(teamEndpoints.TEAM_BY_ID(teamId));
      return response?.data?.results?.[0];
    }
  });
};
