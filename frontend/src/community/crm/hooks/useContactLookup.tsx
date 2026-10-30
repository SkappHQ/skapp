import { useMemo } from "react";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import { useGetContactLookup } from "~community/crm/api/ContactApi";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmContactEntity } from "~community/crm/types/CrmCommonTypes";
import { CrmContactFilterRequest } from "~community/crm/types/CrmTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface ContactLookup {
  isSearchActive: boolean;
  lookupItems: CrmContactEntity[];
  dropdownItems: SearchableDropdownItem[];
}

export const useContactLookup = (searchTerm: string): ContactLookup => {
  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const lookupFilter: CrmContactFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE
    }),
    [debouncedSearch]
  );

  const isSearchActive = debouncedSearch.length > 0;

  const { data: lookupData } = useGetContactLookup(
    lookupFilter,
    isSearchActive
  );

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const dropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      lookupItems.map((contact) => {
        const contactName = getContactDisplayName(contact);
        return {
          id: String(contact.id),
          content: (
            <div className="w-full truncate" title={contactName}>
              {contactName}
            </div>
          )
        };
      }),
    [lookupItems]
  );

  return { isSearchActive, lookupItems, dropdownItems };
};
