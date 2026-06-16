import { useMutation, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  BoardDealsGroupedRequest,
  BoardInitDataResponse,
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  BoardStageDeals
} from "~community/crm/types/CommonTypes";

import { boardEndpoints } from "./utils/ApiEndpoints";
import { boardQueryKeys } from "./utils/QueryKeys";

const fetchBoardInitData = async (): Promise<BoardInitDataResponse> => {
  const response = await authFetch.get(boardEndpoints.INIT_DATA);
  return response?.data?.results?.[0];
};

export const useGetBoardInitData = () => {
  return useQuery({
    queryKey: boardQueryKeys.INIT_DATA,
    queryFn: fetchBoardInitData,
    staleTime: 5 * 60 * 1000
  });
};

const fetchDealsGrouped = async (
  payload: BoardDealsGroupedRequest
): Promise<BoardStageDeals[]> => {
  const response = await authFetch.post(boardEndpoints.DEALS_GROUPED, payload);
  return response?.data?.results as BoardStageDeals[];
};

export const useGetDealsGrouped = (
  stageIds: number[],
  searchKeyword: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: boardQueryKeys.DEALS_GROUPED(stageIds, searchKeyword),
    queryFn: () =>
      fetchDealsGrouped({
        stageIds,
        searchKeyword: searchKeyword || undefined,
        page: null,
        limit: 10
      }),
    enabled
  });
};

const fetchMoreDeals = async (
  payload: BoardDealsGroupedRequest
): Promise<BoardStageDeals> => {
  const response = await authFetch.post(boardEndpoints.DEALS_GROUPED, payload);
  const results = response?.data?.results as BoardStageDeals[];
  return results[0];
};

export const useLoadMoreDeals = (
  onSuccess: (data: BoardStageDeals) => void,
  onError?: (error: unknown) => void
) => {
  return useMutation({
    mutationFn: fetchMoreDeals,
    onSuccess,
    onError
  });
};

const reorderWithinStageFn = async (
  payload: BoardReorderWithinStagePayload
): Promise<void> => {
  await authFetch.patch(boardEndpoints.REORDER_WITHIN_STAGE, payload);
};

export const useReorderWithinStage = (onError?: (error: unknown) => void) => {
  return useMutation({
    mutationFn: reorderWithinStageFn,
    onError
  });
};

const moveBetweenStagesFn = async (
  payload: BoardMoveBetweenStagesPayload
): Promise<void> => {
  await authFetch.patch(boardEndpoints.MOVE_BETWEEN_STAGES, payload);
};

export const useMoveBetweenStages = (onError?: (error: unknown) => void) => {
  return useMutation({
    mutationFn: moveBetweenStagesFn,
    onError
  });
};
