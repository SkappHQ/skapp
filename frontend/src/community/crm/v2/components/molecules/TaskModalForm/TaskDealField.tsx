import { FormikProps } from "formik";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import SelectableSearchField from "~community/common/components/molecules/SelectableSearchField/SelectableSearchField";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useGetDealLookupV2 } from "~community/crm/v2/api/DealApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmDealFilterRequest,
  CrmSidePanelTypes
} from "~community/crm/v2/types/CrmTypes";
import { mergeDeals } from "~community/crm/v2/utils/dealUtil";

interface Props {
  formik: FormikProps<CrmTaskEntity>;
}

const TaskDealField: FC<Props> = ({ formik }) => {
  const { values, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "tasks", "taskModal");

  const {
    deals,
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedCompanyId,
    setDeals
  } = useCrmStoreV2(
    useShallow((store) => ({
      deals: store.deals,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedCompanyId: store.selectedCompanyId,
      setDeals: store.setDeals
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(
    searchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const companyScopeId =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL
      ? (selectedCompanyId ?? undefined)
      : undefined;

  const lookupCompanyId = values.dealId != null ? undefined : companyScopeId;

  const isSearchEnabled =
    debouncedSearch.length > 0 ||
    values.contactId != null ||
    lookupCompanyId != null;

  const lookupFilter: CrmDealFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE,
      contactId: values.contactId,
      companyId: lookupCompanyId
    }),
    [debouncedSearch, values.contactId, lookupCompanyId]
  );

  const { data: lookupData } = useGetDealLookupV2(
    lookupFilter,
    isSearchEnabled
  );

  const lookupItems = useMemo(
    () => lookupData?.items ?? [],
    [lookupData?.items]
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

  const selectedDeal =
    values.dealId != null ? deals[values.dealId] : undefined;

  const handleSelect = (item: SearchableDropdownItem) => {
    const deal = lookupItems.find(
      (lookupDeal) => String(lookupDeal.id) === item.id
    );
    if (deal) setDeals(mergeDeals(deals, [deal]));

    setFieldValue("dealId", deal?.id);
    setSearchTerm("");

    if (deal?.contactId != null) {
      setFieldValue("contactId", deal.contactId);
    }
  };

  const handleClear = () => {
    setFieldValue("dealId", null);
    setSearchTerm("");
  };

  return (
    <SelectableSearchField
      id="deal-search"
      label={translateText(["labels", "deal"])}
      placeholder={translateText(["placeholders", "deal"])}
      selectedValue={selectedDeal?.name ?? ""}
      onClear={handleClear}
      clearAriaLabel={translateText(["ariaLabels", "clearDeal"])}
      fieldAriaLabel={translateText(["ariaLabels", "deal"])}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={isSearchEnabled}
      emptyMessage={translateText(["emptyStates", "noDeals"])}
    />
  );
};

export default TaskDealField;
