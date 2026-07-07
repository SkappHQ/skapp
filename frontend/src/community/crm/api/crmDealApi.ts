import {
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmCreateDealPayload,
  CrmDealCreateResponseType,
  CrmDealDetailResponseType,
  CrmDealFilterParams,
  CrmDealPaginatedResponse,
  CrmDealStageCreatePayload,
  CrmDealStageReorderItem,
  CrmDealStageType,
  CrmDealStageUpdatePayload
} from "~community/crm/types/CommonTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

import { crmDealEndpoints } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

// Standard way to handle paginated API calls using react-query's useInfiniteQuery
export const useGetDealsInfinite = (
  params: CrmDealFilterParams,
  enabled: boolean = true
): UseInfiniteQueryResult<CrmDealPaginatedResponse> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    enabled,
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

export const useGetDealStages = (
  enabled: boolean = true
): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_STAGES,
    queryFn: async (): Promise<CrmDealStageType[]> => {
      const response = await authFetch.get(crmDealEndpoints.DEAL_STAGES);
      return response?.data?.results;
    },
    enabled
  });
};

const createDeal = async (
  payload: CrmCreateDealPayload
): Promise<CrmDealCreateResponseType> => {
  const response = await authFetch.post(crmDealEndpoints.CREATE_DEAL, payload);
  return response?.data?.results?.[0];
};

export const useCreateDeal = (
  onSuccess: (createdDeal: CrmDealCreateResponseType) => void,
  onError: (error: AxiosError) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeal,
    onSuccess: (createdDeal) => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess(createdDeal);
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

const fetchDealById = async (
  id: number
): Promise<CrmDealDetailResponseType> => {
  const response = await authFetch.get(crmDealEndpoints.GET_DEAL_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetDealById = (
  id: number
): UseQueryResult<CrmDealDetailResponseType> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_BY_ID(id),
    queryFn: () => fetchDealById(id),
    refetchOnWindowFocus: false
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
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDealStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.DEAL_STAGES });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const updateDealStage = async ({
  id,
  ...payload
}: CrmDealStageUpdatePayload): Promise<CrmDealStageType> => {
  const response = await authFetch.patch(
    crmDealEndpoints.UPDATE_DEAL_STAGE(id),
    payload
  );
  return response?.data?.results?.[0];
};

export const useUpdateDealStage = (
  onSuccess: () => void,
  onError: () => void
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

const reorderDealStages = async (
  payload: CrmDealStageReorderItem[]
): Promise<CrmDealStageType[]> => {
  const response = await authFetch.post(
    crmDealEndpoints.REORDER_DEAL_STAGES,
    payload
  );
  return response?.data?.results;
};

export const useReorderDealStages = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderDealStages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.DEAL_STAGES });
      onSuccess();
    },
    onError
  });
};

const deleteDealStage = async (id: number): Promise<void> => {
  await authFetch.delete(crmDealEndpoints.DELETE_DEAL_STAGE(id));
};

export const useDeleteDealStage = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDealStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.DEAL_STAGES });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const deleteDeal = async (id: number): Promise<void> => {
  await authFetch.delete(crmDealEndpoints.DELETE_DEAL(id));
};

export const useDeleteDeal = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

export const useDealStageById = (id: number) => {
  return useQueryClient()
    .getQueryData<CrmDealStageType[]>(crmDealQueryKeys.DEAL_STAGES)
    ?.find((stage) => stage.id === id);
};
