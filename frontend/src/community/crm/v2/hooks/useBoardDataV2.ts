import { useEffect } from "react";

import { useGetDealsGroupedByStages } from "../api/CrmBoardApi";
import { useBoardStageIds } from "../store/selectors";
import { ingestBoardStageDeals } from "../utils/boardUtil";

// Loads the board's first page: the stage columns come from the store (already
// bootstrapped by CrmDataProvider on /crm routes), and the per-stage first page
// of deals is fetched and ingested here. Companies referenced by the ingested
// cards are hydrated centrally in DealsSectionV2 off the store's `dealIds`
// (covering load-more too); contacts are already seeded in full by the board
// init-data bootstrap.
export const useBoardDataV2 = ({
  searchKeyword
}: {
  searchKeyword?: string;
}) => {
  const stageIds = useBoardStageIds();

  const { data, isLoading, isFetching } = useGetDealsGroupedByStages(
    { stageIds, searchKeyword },
    stageIds.length > 0
  );

  useEffect(() => {
    if (data) ingestBoardStageDeals(data, { append: false });
  }, [data]);

  return { stageIds, isLoading, isFetching };
};
