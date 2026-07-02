import { useCallback, useState } from "react";

import {
  fetchDealsGroupedByStages,
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
  handleLoadMore: () => Promise<void>;
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

  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsFetchingNextPage(true);

    try {
      const [result] = await fetchDealsGroupedByStages({
        stageIds: [stageId],
        searchKeyword,
        page: currentPage + 1,
        limit: DEFAULT_BOARD_PAGE_SIZE
      });

      if (result) {
        appendBoardStageDeals(
          mapStageDealsToSlice(
            result,
            initData?.owners ?? [],
            initData?.contacts ?? []
          )
        );
      }
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [stageId, currentPage, searchKeyword, appendBoardStageDeals, initData]);

  return { handleLoadMore, isFetchingNextPage };
};
