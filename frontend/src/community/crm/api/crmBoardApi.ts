import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmBoardDealsGroupedRequest,
  CrmBoardInitDataResponse,
  CrmBoardMoveBetweenStagesPayload,
  CrmBoardReorderWithinStagePayload,
  CrmBoardStageDealsResponseType
} from "~community/crm/types/BoardTypes";

import { crmBoardEndpoints } from "./utils/ApiEndpoints";
import { crmBoardQueryKeys } from "./utils/QueryKeys";

export const useGetBoardInitData = (
  enabled: boolean = true
): UseQueryResult<CrmBoardInitDataResponse> => {
  return useQuery({
    queryKey: crmBoardQueryKeys.BOARD_INIT_DATA,
    queryFn: async (): Promise<CrmBoardInitDataResponse> => {
      const response = await authFetch.get(
        crmBoardEndpoints.GET_BOARD_INIT_DATA
      );
      return response?.data?.results?.[0];
    },
    enabled
  });
};

export const fetchDealsGroupedByStages = async (
  payload: CrmBoardDealsGroupedRequest
): Promise<CrmBoardStageDealsResponseType[]> => {
  const response = await authFetch.post(
    crmBoardEndpoints.GET_DEALS_GROUPED_BY_STAGES,
    payload
  );
  return response?.data?.results;
};

export const useGetDealsGroupedByStages = (
  params: CrmBoardDealsGroupedRequest,
  enabled: boolean = true
): UseQueryResult<CrmBoardStageDealsResponseType[]> => {
  return useQuery({
    queryKey: crmBoardQueryKeys.DEALS_GROUPED_BY_STAGES(params),
    queryFn: () => fetchDealsGroupedByStages(params),
    enabled
  });
};

const reorderDealWithinStage = async (
  payload: CrmBoardReorderWithinStagePayload
): Promise<void> => {
  await authFetch.patch(crmBoardEndpoints.REORDER_DEAL_WITHIN_STAGE, payload);
};

export const useReorderDealWithinStage = (
  onError: (error: unknown) => void
) => {
  return useMutation({
    mutationFn: reorderDealWithinStage,
    onError
  });
};

const moveDealBetweenStages = async (
  payload: CrmBoardMoveBetweenStagesPayload
): Promise<void> => {
  await authFetch.patch(crmBoardEndpoints.MOVE_DEAL_BETWEEN_STAGES, payload);
};

export const useMoveDealBetweenStages = (onError: (error: unknown) => void) => {
  return useMutation({
    mutationFn: moveDealBetweenStages,
    onError
  });
};
