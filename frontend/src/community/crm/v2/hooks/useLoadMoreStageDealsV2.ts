import { AxiosError } from "axios";
import { useCallback } from "react";

import { DEFAULT_BOARD_PAGE_SIZE } from "~community/crm/constants/boardConstants";

import { useFetchMoreStageDeals } from "../api/BoardApi";
import { ingestBoardStageDeals } from "../utils/boardUtil";

// Appends the next page of one stage's deals to its column. The column's
// `currentPage`/`hasNextPage` come from the store (set by the last ingest); the
// caller passes the page to request.
export const useLoadMoreStageDealsV2 = ({
  stageId,
  currentPage,
  searchKeyword,
  onError
}: {
  stageId: number;
  currentPage: number;
  searchKeyword?: string;
  onError?: (error: AxiosError) => void;
}) => {
  const { mutate, isPending } = useFetchMoreStageDeals(
    (groups) => ingestBoardStageDeals(groups, { append: true }),
    (error) => onError?.(error)
  );

  const loadMore = useCallback((): void => {
    mutate({
      stageIds: [stageId],
      searchKeyword,
      page: currentPage + 1,
      limit: DEFAULT_BOARD_PAGE_SIZE
    });
  }, [stageId, currentPage, searchKeyword, mutate]);

  return { loadMore, isLoadingMore: isPending };
};
