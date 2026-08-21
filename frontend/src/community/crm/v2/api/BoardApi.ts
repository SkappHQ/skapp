import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmBoardInitDataResponse,
  CrmDealMoveBetweenStagesRequest,
  CrmDealReorderWithinStageRequest,
  CrmDealsByStagesRequest,
  CrmDealsByStagesResponse
} from "~community/crm/v2/types/CrmTypes";

import { crmBoardEndpointsV1 } from "./utils/ApiEndpoints";
import { crmBoardQueryKeys } from "./utils/QueryKeys";

const fetchBoardInitData = async (): Promise<CrmBoardInitDataResponse> => {
  const response = await authFetch.get(crmBoardEndpointsV1.GET_BOARD_INIT_DATA);
  return response?.data?.results?.[0];
};

export const useGetBoardInitData = (
  enabled: boolean
): UseQueryResult<CrmBoardInitDataResponse> =>
  useQuery({
    queryKey: crmBoardQueryKeys.BOARD_INIT_DATA,
    queryFn: fetchBoardInitData,
    enabled
  });

const fetchDealsGroupedByStages = async (
  params: CrmDealsByStagesRequest
): Promise<CrmDealsByStagesResponse[]> => {
  const response = await authFetch.post(
    crmBoardEndpointsV1.GET_DEALS_GROUPED_BY_STAGES,
    params
  );
  return response?.data?.results;
};

export const useGetDealsGroupedByStages = (
  params: CrmDealsByStagesRequest,
  enabled?: boolean
): UseQueryResult<CrmDealsByStagesResponse[]> =>
  useQuery({
    queryKey: crmBoardQueryKeys.DEALS_GROUPED_BY_STAGES(params),
    queryFn: () => fetchDealsGroupedByStages(params),
    enabled,
    refetchOnWindowFocus: false
  });

export const useFetchMoreStageDeals = (
  onSuccess: (stageDeals: CrmDealsByStagesResponse[]) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  CrmDealsByStagesResponse[],
  AxiosError,
  CrmDealsByStagesRequest
> =>
  useMutation({
    mutationFn: fetchDealsGroupedByStages,
    onSuccess,
    onError
  });

const reorderDealWithinStage = async (
  payload: CrmDealReorderWithinStageRequest
): Promise<void> => {
  await authFetch.patch(
    crmBoardEndpointsV1.REORDER_DEAL_WITHIN_STAGE,
    payload
  );
};

export const useReorderDealWithinStage = (
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, CrmDealReorderWithinStageRequest> =>
  useMutation({
    mutationFn: reorderDealWithinStage,
    onError
  });

const moveDealBetweenStages = async (
  payload: CrmDealMoveBetweenStagesRequest
): Promise<void> => {
  await authFetch.patch(
    crmBoardEndpointsV1.MOVE_DEAL_BETWEEN_STAGES,
    payload
  );
};

export const useMoveDealBetweenStages = (
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, CrmDealMoveBetweenStagesRequest> =>
  useMutation({
    mutationFn: moveDealBetweenStages,
    onError
  });
