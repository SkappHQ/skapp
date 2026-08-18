import { useEffect, useMemo } from "react";

import { useGetContactsByIds } from "../api/CrmContactApi";
import { useCrmStoreV2 } from "../store/store";
import { upsertContacts } from "../utils/contactUtil";

// Ensures every contact referenced (by id) on the currently loaded deals/board
// cards is present in the store's `contacts` record. Computes the ids that are
// referenced but not yet loaded, batch-fetches only those, and merges them in.
// Converges: once fetched, `missing` recomputes to empty and the query disables.
export const useHydrateContacts = (contactIds: number[]): void => {
  const contacts = useCrmStoreV2((state) => state.contacts);

  const missing = useMemo(() => {
    const unique = new Set<number>();
    for (const id of contactIds) {
      if (id != null && !contacts[id]) unique.add(id);
    }
    // Sorted so the query key is stable regardless of source order.
    return Array.from(unique).sort((a, b) => a - b);
  }, [contactIds, contacts]);

  const { data } = useGetContactsByIds(missing, missing.length > 0);

  useEffect(() => {
    if (data && data.length > 0) upsertContacts(data);
  }, [data]);
};
