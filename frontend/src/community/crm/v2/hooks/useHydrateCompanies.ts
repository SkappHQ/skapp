import { useEffect, useMemo } from "react";

import { useGetCompaniesByIds } from "../api/CompanyApi";
import { useCrmStoreV2 } from "../store/store";
import { upsertCompanies } from "../utils/companyUtil";

// Ensures every company referenced (by id) on the currently loaded deals/board
// cards is present in the store's `companies` record. Computes the ids that are
// referenced but not yet loaded, batch-fetches only those, and merges them in.
// Converges: once fetched, `missing` recomputes to empty and the query disables.
export const useHydrateCompanies = (companyIds: number[]): void => {
  const companies = useCrmStoreV2((state) => state.companies);

  const missing = useMemo(() => {
    const unique = new Set<number>();
    for (const id of companyIds) {
      if (id != null && !companies[id]) unique.add(id);
    }
    // Sorted so the query key is stable regardless of source order.
    return Array.from(unique).sort((a, b) => a - b);
  }, [companyIds, companies]);

  const { data } = useGetCompaniesByIds(missing, missing.length > 0);

  useEffect(() => {
    if (data && data.length > 0) upsertCompanies(data);
  }, [data]);
};
