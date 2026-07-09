import { useCallback, useEffect } from "react";

import {
  useFetchMoreStageDeals,
  useGetBoardInitData
} from "~community/crm/api/BoardApi";
import {
  DEFAULT_BOARD_PAGE_SIZE,
  INITIAL_BOARD_PAGE
} from "~community/crm/constants/boardConstants";
import { useCrmStore } from "~community/crm/store/store";
import { mapStageDealsToSlice } from "~community/crm/utils/kanbanUtil";

interface UseRefreshStageDealsReturn {
  refreshStages: (stageIds: number[]) => void;
}

export const useRefreshStageDeals = (): UseRefreshStageDealsReturn => {
  const { boardSearchKeyword, replaceBoardStageDeals } = useCrmStore(
    (store) => ({
      boardSearchKeyword: store.boardSearchKeyword,
      replaceBoardStageDeals: store.replaceBoardStageDeals
    })
  );

  const { data: initData } = useGetBoardInitData();

  const { mutate, results } = useFetchMoreStageDeals();

  useEffect(() => {
    if (results) {
      replaceBoardStageDeals(
        results.map((stageDeals) =>
          mapStageDealsToSlice(
            stageDeals,
            initData?.owners ?? [],
            initData?.contacts ?? []
          )
        )
      );
    }
  }, [results]);

  const refreshStages = useCallback(
    (stageIds: number[]) => {
      mutate({
        stageIds,
        searchKeyword: boardSearchKeyword,
        page: INITIAL_BOARD_PAGE,
        limit: DEFAULT_BOARD_PAGE_SIZE
      });
    },
    [mutate, boardSearchKeyword]
  );

  return { refreshStages };
};
