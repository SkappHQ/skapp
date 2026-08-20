import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useGetDealsInfinite } from "../api/DealApi";
import { useCrmStoreV2 } from "../store/store";
import { CrmDealEntity } from "../types/CrmCommonTypes";
import { CrmDealFilterRequest } from "../types/CrmTypes";
import { ingestDeals } from "../utils/dealUtil";

// List view of the v2 deal module. Wraps the infinite v2 deal query, ingests
// each scalar page into the normalized `deals` record (via `ingestDeals`), and
// returns the joined deals in `dealIds` order. The deal payload only carries ids
// now, so the related owner/contact/company/stage records are populated
// elsewhere (lookup / reference endpoints), not here.
export const useDealsListV2 = (
  filters: CrmDealFilterRequest,
  enabled?: boolean
) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetDealsInfinite(filters, enabled);

  const deals = useCrmStoreV2(
    useShallow((state) =>
      state.dealIds
        .map((id) => state.deals[id])
        .filter((deal): deal is CrmDealEntity => Boolean(deal))
    )
  );

  useEffect(() => {
    if (!data) return;
    ingestDeals(data.pages.flatMap((page) => page.items));
  }, [data]);

  return {
    deals,
    isLoading,
    hasNextPage: Boolean(hasNextPage),
    fetchNextPage,
    isFetchingNextPage
  };
};
