import { useEffect } from "react";

import {
  useGetBoardInitData,
  useGetDealsGroupedByStages
} from "~community/crm/api/BoardApi";
import {
  DEFAULT_BOARD_PAGE_SIZE,
  INITIAL_BOARD_PAGE
} from "~community/crm/constants/boardConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { normalizeStageDeals } from "~community/crm/utils/kanbanUtil";

interface UseBoardDataParams {
  searchKeyword?: string;
}

interface UseBoardDataReturn {
  boardStages: CrmDealStageType[];
  isLoading: boolean;
}

export const useBoardData = ({
  searchKeyword = ""
}: UseBoardDataParams): UseBoardDataReturn => {
  const setBoardStageDeals = useCrmStore((store) => store.setBoardStageDeals);

  const { data: initData, isLoading: isInitDataLoading } =
    useGetBoardInitData();

  const boardStages = initData?.stages ?? [];
  const stageIds = boardStages.map((stage) => stage.id);

  const { data: dealsByStages, isLoading: isDealsLoading } =
    useGetDealsGroupedByStages(
    {
      stageIds,
      searchKeyword,
      page: INITIAL_BOARD_PAGE,
      limit: DEFAULT_BOARD_PAGE_SIZE
    },
    stageIds.length > 0
  );

  useEffect(() => {
    if (!initData || !dealsByStages) return;
    setBoardStageDeals(
      normalizeStageDeals(dealsByStages, initData.owners, initData.contacts)
    );
  }, [initData, dealsByStages, setBoardStageDeals]);

  return {
    boardStages,
    isLoading: isInitDataLoading || isDealsLoading
  };
};
