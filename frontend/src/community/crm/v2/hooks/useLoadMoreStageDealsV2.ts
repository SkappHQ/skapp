import { AxiosError } from "axios";

import { useFetchMoreStageDeals } from "../api/CrmBoardApi";
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

  const loadMore = (): void => {
    mutate({ stageIds: [stageId], searchKeyword, page: currentPage + 1 });
  };

  return { loadMore, isLoadingMore: isPending };
};
