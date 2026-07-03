import { useCallback, useEffect } from "react";

import {
  useFetchMoreStageDeals,
  useGetBoardInitData
} from "~community/crm/api/BoardApi";
import { DEFAULT_BOARD_PAGE_SIZE } from "~community/crm/constants/boardConstants";
import { useCrmStore } from "~community/crm/store/store";
import { mapStageDealsToSlice } from "~community/crm/utils/kanbanUtil";

interface UseLoadMoreStageDealsParams {
  stageId: number;
  currentPage: number;
  searchKeyword?: string;
}

interface UseLoadMoreStageDealsReturn {
  handleLoadMore: () => void;
  isFetchingNextPage: boolean;
}

export const useLoadMoreStageDeals = ({
  stageId,
  currentPage,
  searchKeyword = ""
}: UseLoadMoreStageDealsParams): UseLoadMoreStageDealsReturn => {
  const appendBoardStageDeals = useCrmStore(
    (store) => store.appendBoardStageDeals
  );

  const { data: initData } = useGetBoardInitData();

  const { mutate, isPending, results } = useFetchMoreStageDeals();

  useEffect(() => {
    if (results) {
      appendBoardStageDeals(
        mapStageDealsToSlice(
          results[0],
          initData?.owners ?? [],
          initData?.contacts ?? []
        )
      );
    }
  }, [results]);

  const handleLoadMore = useCallback(() => {
    mutate({
      stageIds: [stageId],
      searchKeyword,
      page: currentPage + 1,
      limit: DEFAULT_BOARD_PAGE_SIZE
    });
  }, [stageId, currentPage, searchKeyword, mutate]);

  return { handleLoadMore, isFetchingNextPage: isPending };
};
