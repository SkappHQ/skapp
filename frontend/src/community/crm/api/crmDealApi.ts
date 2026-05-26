import {
  UseQueryResult,
  useInfiniteQuery,
  useQuery
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmDealFilterParams,
  CrmDealPaginatedResponseType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

import { crmDealEndpoints } from "./utils/ApiEndpoints";

import { crmDealQueryKeys } from "./utils/QueryKeys";

export const useGetDealStages = (): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.GET_DEAL_STAGES,
    queryFn: async () => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEAL_STAGES);
      return (response?.data?.results ?? []) as CrmDealStageType[];
    }
  });
};

export const useGetDealsInfinite = (
  params: Omit<CrmDealFilterParams, "page">
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    queryFn: async ({ pageParam }) => {
      const response = await authFetch.get(
        crmDealEndpoints.GET_DEALS({ ...params, page: pageParam as number })
      );
      return (response?.data?.results?.[0] ?? {
        items: [],
        currentPage: 0,
        totalItems: 0,
        totalPages: 0
      }) as CrmDealPaginatedResponseType;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};


