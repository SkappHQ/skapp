import { FormikProps } from "formik";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealLookup } from "~community/crm/api/DealApi";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import { CrmDealFilterRequest } from "~community/crm/types/CrmTypes";
import { mergeDeals } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogCallFormValues>;
  isClearedNoticeVisible: boolean;
  onDealChange: () => void;
}

const LogCallDealField: FC<Props> = ({
  id,
  formik,
  isClearedNoticeVisible,
  onDealChange
}) => {
  const { values, setFieldValue } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logCall",
    "modal"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logCall",
    "modal"
  );

  const { contacts, deals, setDeals } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals,
      setDeals: store.setDeals
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const selectedContact = values.contactId ? contacts[values.contactId] : null;
  const contactCompanyId = selectedContact?.companyId;

  const isSearchEnabled =
    debouncedSearch.length > 0 || Boolean(contactCompanyId);

  const lookupFilter: CrmDealFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE,
      ...(contactCompanyId ? { companyId: contactCompanyId } : {})
    }),
    [debouncedSearch, contactCompanyId]
  );

  const { data: lookupData } = useGetDealLookup(lookupFilter, isSearchEnabled);

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const dropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      lookupItems.map((deal) => ({
        id: String(deal.id),
        content: (
          <div className="w-full truncate" title={deal.name}>
            {deal.name}
          </div>
        )
      })),
    [lookupItems]
  );

  const selectedDeal = values.dealId ? deals[values.dealId] : null;

  const handleSelect = (item: SearchableDropdownItem): void => {
    const deal = lookupItems.find(
      (lookupDeal) => String(lookupDeal.id) === item.id
    );
    setSearchTerm("");

    if (!deal?.id) return;

    setDeals(mergeDeals(deals, [deal]));
    setFieldValue("dealId", deal.id);
    onDealChange();
  };

  const handleClear = (): void => {
    setFieldValue("dealId", null);
    setSearchTerm("");
    onDealChange();
  };

  return (
    <div className="flex flex-col gap-1">
      <SelectableSearchField
        positionStrategy="fixed"
        id={id}
        label={translateText(["labels", "deal"])}
        placeholder={translateText(["placeholders", "deal"])}
        selectedValue={selectedDeal?.name ? selectedDeal.name : ""}
        onClear={handleClear}
        clearAriaLabel={translateAria(["clearDeal"])}
        fieldAriaLabel={translateAria(["deal"])}
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        items={dropdownItems}
        onSelect={handleSelect}
        isOpenOnFocus={isSearchEnabled}
        emptyMessage={translateText(["emptyStates", "noDeals"])}
      />
      {isClearedNoticeVisible && (
        <output className="text-sm text-semantic-amber-text">
          {translateText(["notices", "dealCleared"])}
        </output>
      )}
    </div>
  );
};

export default LogCallDealField;
