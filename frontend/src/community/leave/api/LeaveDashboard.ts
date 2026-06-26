import { useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import { leaveTypeBreakdownPreProcessor } from "../actions/LeaveTypeBreakdownPreProcessor";
import { leaveDashboardEndPoints } from "./utils/ApiEndpoints";
import { dashboardQueryKeys } from "./utils/QueryKeys";

export const useGetResourceAvailability = (
  teams: number | string,
  startDate: string,
  endDate: string,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: dashboardQueryKeys.RESOURCE_AVAILABILITY(
      teams,
      startDate,
      endDate
    ),
    queryFn: async () => {
      const { data } = await authFetch(
        leaveDashboardEndPoints.GET_RESOURCE_AVAILABILITY,
        {
          params: {
            teams,
            startDate,
            endDate
          }
        }
      );
      return data;
    },
    select: (data) => {
      return data?.results;
    },
    enabled
  });
};

export const useGetResourceAvailabilityCalendar = (
  teams: number | string,
  year: number,
  month: string,
  enabled?: boolean
) => {
  return useQuery({
    queryKey: dashboardQueryKeys.RESOURCE_AVAILABILITY_CALENDAR(
      teams,
      year,
      month
    ),
    queryFn: async () => {
      const { data } = await authFetch(
        leaveDashboardEndPoints.GET_RESOURCE_AVAILABILITY,
        {
          params: {
            teams,
            year,
            month
          }
        }
      );
      return data;
    },
    select: (data) => {
      return data?.results;
    },
    enabled
  });
};

export const useGetLeaveTypeBreakdownChartData = (teamIds: string | number) => {
  return useQuery({
    queryKey: dashboardQueryKeys.LEAVE_UTILIZATION(teamIds),
    queryFn: async () => {
      return await authFetch.get(
        leaveDashboardEndPoints.LEAVE_TYPE_BREAKDOWN_CHART,
        {
          params: {
            teamIds
          }
        }
      );
    },
    select: (response) => {
      return leaveTypeBreakdownPreProcessor(response?.data?.results?.[0]);
    },
    enabled: true
  });
};

export const useGetAvailability = (
  teams: number | string,
  date: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: dashboardQueryKeys.TODAYS_AVAILABILITY(teams, date),
    queryFn: async () => {
      const { data } = await authFetch(
        leaveDashboardEndPoints.TODAYS_AVAILABILITY,
        {
          params: {
            teamIds: teams,
            date: date
          }
        }
      );
      return data;
    },
    select: (data) => {
      return data?.results;
    },
    enabled
  });
};

export const useGetPendingLeavesData = (teams: number | string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.PENDING_REQUESTS(teams),
    queryFn: async () => {
      const { data } = await authFetch.get(
        leaveDashboardEndPoints.PENDING_LEAVES,
        {
          params: {
            teamIds: teams
          }
        }
      );
      return data;
    },
    select: (data) => {
      return data?.results;
    },
    enabled: true
  });
};

export const useGetAbsenceRate = (
  teamIds: string | number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: dashboardQueryKeys.ABSENCE_RATE(teamIds),
    queryFn: async () => {
      const { data } = await authFetch.get(
        leaveDashboardEndPoints.ABSENCE_RATE,
        {
          params: {
            teamIds
          }
        }
      );
      return data;
    },
    select: (data) => {
      return data?.results;
    },
    enabled
  });
};
