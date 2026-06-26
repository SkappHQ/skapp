import { useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import {
  employmentBreakdownGraphPreprocessor,
  genderDistributionGraphPreprocessor,
  jobFamilyGraphPreprocessor
} from "../actions/peopleDashboardPreprocessor";
import { peopleDashboardEndpoints } from "./utils/ApiEndpoints";
import { getPeopleDashboardQueryKeys } from "./utils/QueryKeys";

export const useGetEmploymentBreakdownGraphData = (
  teams: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getPeopleDashboardQueryKeys.employmentBreakdownGraphData(teams),
    queryFn: async () => {
      const url =
        peopleDashboardEndpoints.GET_EMPLOYMENT_BREAKDOWN_GRAPH_DATA();
      return await authFetch.get(url, {
        params: {
          teams
        }
      });
    },
    select(response) {
      return employmentBreakdownGraphPreprocessor(
        response?.data?.results?.[0] ?? null
      );
    },
    enabled
  });
};

export const useGetGenderDistributionGraphData = (
  teams: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getPeopleDashboardQueryKeys.genderDistributionGraphData(teams),
    queryFn: async () => {
      const url = peopleDashboardEndpoints.GET_GENDER_DISTRIBUTION_GRAPH_DATA();
      return await authFetch.get(url, {
        params: {
          teams
        }
      });
    },
    select(response) {
      return genderDistributionGraphPreprocessor(
        response?.data?.results?.[0] ?? null
      );
    },
    enabled
  });
};

export const useGetJobFamilyOverviewGraphData = (
  teams: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getPeopleDashboardQueryKeys.jobFamilyOverviewGraphData(teams),
    queryFn: async () => {
      const url = peopleDashboardEndpoints.GET_JOB_FAMILY_OVERVIEW_GRAPH_DATA();
      return await authFetch.get(url, {
        params: {
          teams
        }
      });
    },
    select(response) {
      return jobFamilyGraphPreprocessor(response?.data?.results?.[0] ?? null);
    },
    enabled
  });
};

export const useGetPeopleDashboardAnalytics = (
  teams: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getPeopleDashboardQueryKeys.peopleDashboardAnalyticsData(teams),
    queryFn: async () => {
      const url =
        peopleDashboardEndpoints.GET_PEOPLE_DASHBOARD_ANALYTICS_DATA();
      return await authFetch.get(url, {
        params: {
          teams
        }
      });
    },
    select(response) {
      return response?.data?.results?.[0];
    },
    enabled
  });
};
