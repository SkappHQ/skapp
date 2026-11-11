import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompanyLookup } from "~community/crm/api/CompanyApi";
import SidePanelLinkPopupField from "~community/crm/components/molecules/SidePanelLinkPopupField/SidePanelLinkPopupField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";

interface Props {
  id: string;
  companyId: number | null;
  emptyLabel: string;
  editAriaLabel: string;
  clearAriaLabel: string;
  onCompanyClick: (companyId: number) => void;
  onChange: (companyId: number | null) => void;
}

const SidePanelCompanyField: FC<Props> = ({
  id,
  companyId,
  emptyLabel,
  editAriaLabel,
  clearAriaLabel,
  onCompanyClick,
  onChange
}) => {
  const translateText = useTranslator("crmModule", "activities", "logActivity");

  const { companies, setCompanies } = useCrmStore(
    useShallow((state) => ({
      companies: state.companies,
      setCompanies: state.setCompanies
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const lookupFilter = useMemo(
    () => ({ searchKeyword: debouncedSearch, size: DEFAULT_LOOKUP_PAGE_SIZE }),
    [debouncedSearch]
  );

  const { data: lookupData } = useGetCompanyLookup(
    lookupFilter,
    debouncedSearch.length > 0
  );

  const lookupItems = useMemo(
    () => (lookupData ? lookupData.items : []),
    [lookupData]
  );

  const options = lookupItems.flatMap((company) =>
    company.id
      ? [{ id: company.id, value: company.id, label: company.name }]
      : []
  );

  const selectedCompany = companyId ? companies[companyId] : null;

  const handleSelect = (selectedId: number): void => {
    const company = lookupItems.find((item) => item.id === selectedId);
    setSearchTerm("");

    if (!company) return;

    setCompanies(updateCompanyRecord(companies, [company]));
    onChange(selectedId);
  };

  const handleLinkClick = (): void => {
    if (companyId) onCompanyClick(companyId);
  };

  return (
    <SidePanelLinkPopupField
      id={id}
      options={options}
      selectedId={selectedCompany ? companyId : null}
      linkLabel={selectedCompany?.name ? selectedCompany.name : ""}
      emptyLabel={emptyLabel}
      editAriaLabel={editAriaLabel}
      searchPlaceholder={translateText(["placeholders", "relatedTo"])}
      noResultsText={translateText(["emptyStates", "noCompanies"])}
      onLinkClick={handleLinkClick}
      onSearch={setSearchTerm}
      onSelect={handleSelect}
      clearAriaLabel={clearAriaLabel}
      onClear={() => onChange(null)}
    />
  );
};

export default SidePanelCompanyField;
