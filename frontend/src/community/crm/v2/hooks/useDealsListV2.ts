import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useGetDealsInfinite } from "../api/DealApi";
import { useCrmStoreV2 } from "../store/store";
import { CrmDealEntity } from "../types/CrmCommonTypes";
import { CrmDealFilterRequest } from "../types/CrmTypes";
import { ingestDeals } from "../utils/dealUtil";

export const useDealsListV2 = (
  filters: CrmDealFilterRequest,
  enabled?: boolean
) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetDealsInfinite(filters, enabled);

  const { dealIds, dealRecord } = useCrmStoreV2(
    useShallow((store) => ({
      dealIds: store.dealIds,
      dealRecord: store.deals
    }))
  );

  const deals = useMemo(
    () =>
      dealIds
        .map((id) => dealRecord[id])
        .filter((deal): deal is CrmDealEntity => Boolean(deal)),
    [dealIds, dealRecord]
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
