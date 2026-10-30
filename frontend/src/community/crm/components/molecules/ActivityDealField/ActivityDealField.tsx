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
import {
  CrmLogCallFormValues,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import { CrmDealFilterRequest } from "~community/crm/types/CrmTypes";
import { mergeDeals } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  formik:
    FormikProps<CrmLogCallFormValues> | FormikProps<CrmLogMeetingFormValues>;
  fieldAriaLabel: string;
  clearedNoticeText: string;
  isClearedNoticeVisible: boolean;
  onDealChange: () => void;
  filterCompanyId?: number;
  errorMessage?: string;
}

const ActivityDealField: FC<Props> = ({
  id,
  formik,
  fieldAriaLabel,
  clearedNoticeText,
  isClearedNoticeVisible,
  onDealChange,
  filterCompanyId,
  errorMessage
}) => {
  const { values, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "activities", "logActivity");
  const translateAria = useTranslator("crmAria", "activities", "logActivity");

  const { deals, setDeals } = useCrmStore(
    useShallow((store) => ({
      deals: store.deals,
      setDeals: store.setDeals
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const isSearchEnabled =
    debouncedSearch.length > 0 || Boolean(filterCompanyId);

  const lookupFilter: CrmDealFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE,
      ...(filterCompanyId && { companyId: filterCompanyId })
    }),
    [debouncedSearch, filterCompanyId]
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
        fieldAriaLabel={fieldAriaLabel}
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        items={dropdownItems}
        onSelect={handleSelect}
        isOpenOnFocus={isSearchEnabled}
        emptyMessage={translateText(["emptyStates", "noDeals"])}
        {...(errorMessage && { errorMessage })}
      />
      {isClearedNoticeVisible && (
        <span className="text-sm text-semantic-amber-text">
          {clearedNoticeText}
        </span>
      )}
    </div>
  );
};

export default ActivityDealField;
