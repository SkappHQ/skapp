import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import { useGetDealsByIds } from "~community/crm/api/DealApi";
import { useCrmStore } from "~community/crm/store/store";
import { getMissingDealIds, mergeDeals } from "~community/crm/utils/dealUtil";

export const useActivityDeals = (rows: ActivityRow[]): void => {
  const { deals, setDeals } = useCrmStore(
    useShallow((store) => ({
      deals: store.deals,
      setDeals: store.setDeals
    }))
  );

  const missingDealIds = useMemo(
    () =>
      getMissingDealIds(
        rows.flatMap((row) => (row.dealId ? [row.dealId] : [])),
        deals
      ),
    [rows, deals]
  );

  const { data: fetchedDeals } = useGetDealsByIds(
    missingDealIds,
    missingDealIds.length > 0
  );

  useEffect(() => {
    if (!fetchedDeals?.length) return;

    setDeals(mergeDeals(deals, fetchedDeals));
  }, [fetchedDeals]);
};
