import { useEffect } from "react";

import { DEFAULT_BOARD_PAGE_SIZE } from "~community/crm/constants/boardConstants";

import { useGetDealsGroupedByStages } from "../api/BoardApi";
import { useBoardStageIds } from "../store/selectors";
import { ingestBoardStageDeals } from "../utils/boardUtil";

export const useBoardDataV2 = ({
  searchKeyword
}: {
  searchKeyword?: string;
}) => {
  const stageIds = useBoardStageIds();

  const { data, isLoading, isFetching } = useGetDealsGroupedByStages(
    { stageIds, searchKeyword, limit: DEFAULT_BOARD_PAGE_SIZE },
    stageIds.length > 0
  );

  useEffect(() => {
    if (data) ingestBoardStageDeals(data, { append: false });
  }, [data]);

  return { stageIds, isLoading, isFetching };
};
