import {
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import {
  CrmDealEntity,
  CrmStageEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { CrmDealListViewConfig } from "~community/crm/v2/types/CrmListViewConfigTypes";
import {
  CrmDealFilterRequest,
  CrmDealListReorderRequest,
  CrmDealListResponse,
  CrmDealStageReorderItem,
  CrmExistsResponse
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

import { crmDealEndpoints, crmDealEndpointsV2 } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

const fetchDealsByIds = async (ids: number[]): Promise<CrmDealEntity[]> => {
  const response = await authFetch.post(crmDealEndpoints.GET_DEALS_BY_IDS, {
    ids
  });
  return response?.data?.results;
};

export const useGetDealsByIds = (
  dealIds: number[],
  enabled: boolean
): UseQueryResult<CrmDealEntity[]> =>
  useQuery({
    queryKey: crmDealQueryKeys.DEALS_BY_IDS(dealIds),
    queryFn: () => fetchDealsByIds(dealIds),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchDeals = async (
  filters: CrmDealFilterRequest
): Promise<CrmDealListResponse> => {
  const response = await authFetchV2.get(crmDealEndpointsV2.GET_DEALS, {
    params: filters
  });
  return response?.data?.results?.[0];
};

export const useGetDealLookupV2 = (
  filters: CrmDealFilterRequest,
  enabled: boolean
): UseQueryResult<CrmDealListResponse> =>
  useQuery({
    queryKey: crmDealQueryKeys.GET_DEALS(filters),
    queryFn: () => fetchDeals(filters),
    enabled,
    refetchOnWindowFocus: false
  });

export const useGetDealsInfinite = (
  filters: CrmDealFilterRequest,
  enabled?: boolean
) =>
  useInfiniteQuery({
    enabled,
    queryKey: crmDealQueryKeys.GET_DEALS(filters),
    queryFn: ({ pageParam = 0 }) => fetchDeals({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage.currentPage < lastPage.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false
  });

const reorderDealInList = async (
  payload: CrmDealListReorderRequest
): Promise<void> => {
  await authFetch.patch(crmDealEndpoints.REORDER_DEAL, payload);
};

export const useReorderDealInList = (): UseMutationResult<
  void,
  AxiosError,
  CrmDealListReorderRequest
> => useMutation({ mutationFn: reorderDealInList });

const fetchDealById = async (id: number): Promise<CrmDealEntity> => {
  const response = await authFetchV2.get(crmDealEndpointsV2.GET_DEAL_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetDealById = (
  id: number,
  enabled?: boolean
): UseQueryResult<CrmDealEntity> =>
  useQuery({
    queryKey: crmDealQueryKeys.DEAL_BY_ID(id),
    queryFn: () => fetchDealById(id),
    enabled,
    refetchOnWindowFocus: false
  });

const createDeal = async (payload: CrmDealEntity): Promise<CrmDealEntity> => {
  const response = await authFetchV2.post(
    crmDealEndpointsV2.CREATE_DEAL,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateDeal = (
  onSuccess: (createdDeal: CrmDealEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmDealEntity, AxiosError, CrmDealEntity> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeal,
    onSuccess: (createdDeal) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess(createdDeal);
    },
    onError
  });
};

const editDeal = async (deal: CrmDealEntity): Promise<CrmDealEntity> => {
  const { id, ...payload } = deal;
  const response = await authFetchV2.patch(
    crmDealEndpointsV2.EDIT_DEAL(id!),
    payload
  );
  return response?.data?.results?.[0];
};

export const useEditDeal = (
  onSuccess: (updatedDeal: CrmDealEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmDealEntity, AxiosError, CrmDealEntity> =>
  useMutation({
    mutationFn: editDeal,
    onSuccess,
    onError
  });

const checkDealNameExists = async (
  name: string
): Promise<CrmExistsResponse> => {
  const response = await authFetch.get(
    crmDealEndpoints.CHECK_DEAL_NAME_EXISTS,
    { params: { name } }
  );
  return response?.data?.results?.[0];
};

export const useCheckDealNameExists = (
  name: string,
  enabled: boolean
): UseQueryResult<CrmExistsResponse> =>
  useQuery({
    queryKey: crmDealQueryKeys.CHECK_DEAL_NAME_EXISTS(name),
    queryFn: () => checkDealNameExists(name),
    enabled
  });

const fetchDealListViewConfig = async (): Promise<CrmDealListViewConfig> => {
  const response = await authFetch.get(crmDealEndpoints.LIST_VIEW_CONFIG);
  return response?.data?.results?.[0];
};

export const useGetDealListViewConfig = (
  enabled?: boolean
): UseQueryResult<CrmDealListViewConfig> =>
  useQuery({
    queryKey: crmDealQueryKeys.LIST_VIEW_CONFIG,
    queryFn: fetchDealListViewConfig,
    enabled,
    refetchOnWindowFocus: false
  });

const updateDealListViewConfig = async (
  config: CrmDealListViewConfig
): Promise<CrmDealListViewConfig> => {
  const response = await authFetch.put(
    crmDealEndpoints.LIST_VIEW_CONFIG,
    config
  );
  return response?.data?.results?.[0];
};

export const useUpdateDealListViewConfig = (): UseMutationResult<
  CrmDealListViewConfig,
  AxiosError,
  CrmDealListViewConfig
> => useMutation({ mutationFn: updateDealListViewConfig });

const deleteDeal = async (id: number): Promise<void> => {
  await authFetch.delete(crmDealEndpoints.DELETE_DEAL(id));
};

export const useDeleteDeal = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const fetchDealStages = async (): Promise<CrmStageEntity[]> => {
  const response = await authFetch.get(crmDealEndpoints.DEAL_STAGES);
  return response?.data?.results;
};

export const useGetDealStages = (
  enabled?: boolean
): UseQueryResult<CrmStageEntity[]> =>
  useQuery({
    queryKey: crmDealQueryKeys.DEAL_STAGES,
    queryFn: fetchDealStages,
    enabled
  });

const createDealStage = async (
  payload: CrmStageEntity
): Promise<CrmStageEntity> => {
  const response = await authFetch.post(
    crmDealEndpoints.CREATE_DEAL_STAGE,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateDealStage = (
  onSuccess: (createdStage: CrmStageEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmStageEntity, AxiosError, CrmStageEntity> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDealStage,
    onSuccess: (createdStage) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess(createdStage);
    },
    onError
  });
};

const updateDealStage = async (
  stage: CrmStageEntity
): Promise<CrmStageEntity> => {
  const { id, ...payload } = stage;
  const response = await authFetch.patch(
    crmDealEndpoints.UPDATE_DEAL_STAGE(id!),
    payload
  );
  return response?.data?.results?.[0];
};

export const useUpdateDealStage = (
  onSuccess: (updatedStage: CrmStageEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmStageEntity, AxiosError, CrmStageEntity> =>
  useMutation({
    mutationFn: updateDealStage,
    onSuccess,
    onError
  });

const reorderDealStages = async (
  payload: CrmDealStageReorderItem[]
): Promise<CrmStageEntity[]> => {
  const response = await authFetch.post(
    crmDealEndpoints.REORDER_DEAL_STAGES,
    payload
  );
  return response?.data?.results;
};

export const useReorderDealStages = (
  onSuccess: (reorderedStages: CrmStageEntity[]) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmStageEntity[], AxiosError, CrmDealStageReorderItem[]> =>
  useMutation({
    mutationFn: reorderDealStages,
    onSuccess,
    onError
  });

const deleteDealStage = async (id: number): Promise<void> => {
  await authFetch.delete(crmDealEndpoints.DELETE_DEAL_STAGE(id));
};

export const useDeleteDealStage = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDealStage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};
