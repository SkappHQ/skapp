import {
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmCreateDealPayload,
  CrmDealFilterParams,
  CrmDealPaginatedResponse,
  CrmDealStageCreatePayload,
  CrmDealStageType,
  CrmDealStageUpdatePayload,
  CrmDealType
} from "~community/crm/types/CommonTypes";

import { crmDealEndpoints } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

// Standard way to handle paginated API calls using react-query's useInfiniteQuery
export const useGetDealsInfinite = (
  params: CrmDealFilterParams
): UseInfiniteQueryResult<CrmDealPaginatedResponse> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
        params: {
          page: pageParam,
          ...params
        }
      });
      return response?.data?.results?.[0] as CrmDealPaginatedResponse;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useGetDealStages = (): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_STAGES,
    queryFn: async (): Promise<CrmDealStageType[]> => {
      const response = await authFetch.get(crmDealEndpoints.DEAL_STAGES);
      return response?.data?.results;
    }
  });
};

const createDeal = async (
  payload: CrmCreateDealPayload
): Promise<CrmDealType> => {
  const response = await authFetch.post(crmDealEndpoints.CREATE_DEAL, payload);
  return response?.data?.results?.[0];
};

export const useCreateDeal = (
  onSuccess: () => void,
  onError: (error: unknown) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const fetchDealLookup = async (
  searchKeyword: string,
  size: number
): Promise<CrmDealPaginatedResponse> => {
  const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
    params: {
      size,
      searchKeyword
    }
  });
  return response?.data?.results?.[0];
};

export const useGetDealLookup = (
  searchKeyword: string,
  size: number,
  enabled: boolean = true
): UseQueryResult<CrmDealPaginatedResponse> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_LOOKUP(searchKeyword),
    queryFn: () => fetchDealLookup(searchKeyword, size),
    enabled
  });
};

const createDealStage = async (
  payload: CrmDealStageCreatePayload
): Promise<CrmDealStageType> => {
  const response = await authFetch.post(
    crmDealEndpoints.CREATE_DEAL_STAGE,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateDealStage = (
  onSuccess: () => void,
  onError: (error: unknown) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDealStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.DEAL_STAGES });
      onSuccess();
    },
    onError
  });
};

const updateDealStage = async (
  payload: CrmDealStageUpdatePayload
): Promise<CrmDealStageType> => {
  const { id, ...rest } = payload;
  const response = await authFetch.patch(
    crmDealEndpoints.UPDATE_DEAL_STAGE(id),
    rest
  );
  return response?.data?.results?.[0];
};

export const useUpdateDealStage = (
  onSuccess: () => void,
  onError: (error: unknown) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDealStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.DEAL_STAGES });
      onSuccess();
    },
    onError
  });
};
