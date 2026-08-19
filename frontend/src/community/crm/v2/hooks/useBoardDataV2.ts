import { useEffect, useMemo } from "react";

import { useGetDealsGroupedByStages } from "../api/CrmBoardApi";
import { useBoardStageIds } from "../store/selectors";
import { ingestBoardStageDeals } from "../utils/boardUtil";
import { useHydrateCompanies } from "./useHydrateCompanies";

// Loads the board's first page: the stage columns come from the store (already
// bootstrapped by CrmDataProvider on /crm routes), and the per-stage first page
// of deals is fetched and ingested here. Companies referenced by those cards are
// hydrated by id (they are not embedded on the scalar board payload); contacts
// are already seeded in full by the board init-data bootstrap.
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

  const companyIds = useMemo(
    () =>
      (data ?? [])
        .flatMap((group) => group.deals.map((deal) => deal.companyId))
        .filter((id): id is number => id != null),
    [data]
  );
  useHydrateCompanies(companyIds);

  return { stageIds, isLoading, isFetching };
};
