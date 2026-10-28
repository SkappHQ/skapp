import { FormikProps } from "formik";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCompanyLookup } from "~community/crm/api/CompanyApi";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import { CrmCompanyFilterRequest } from "~community/crm/types/CrmTypes";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogCallFormValues>;
}

const LogCallCompanyField: FC<Props> = ({ id, formik }) => {
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

  const { companies, setCompanies } = useCrmStore(
    useShallow((store) => ({
      companies: store.companies,
      setCompanies: store.setCompanies
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm.trim(), SEARCH_DEBOUNCE_DELAY);

  const lookupFilter: CrmCompanyFilterRequest = useMemo(
    () => ({
      searchKeyword: debouncedSearch,
      size: DEFAULT_LOOKUP_PAGE_SIZE
    }),
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

  const dropdownItems: SearchableDropdownItem[] = useMemo(
    () =>
      lookupItems.map((company) => ({
        id: String(company.id),
        content: (
          <div className="w-full truncate" title={company.name}>
            {company.name}
          </div>
        )
      })),
    [lookupItems]
  );

  const selectedCompany = values.companyId ? companies[values.companyId] : null;

  const handleSelect = (item: SearchableDropdownItem): void => {
    const company = lookupItems.find(
      (lookupCompany) => String(lookupCompany.id) === item.id
    );
    setSearchTerm("");

    if (!company || !company.id) return;

    setCompanies(updateCompanyRecord(companies, [company]));
    setFieldValue("companyId", company.id);
  };

  const handleClear = (): void => {
    setFieldValue("companyId", null);
    setSearchTerm("");
  };

  return (
    <SelectableSearchField
      id={id}
      label={translateText(["labels", "relatedTo"])}
      placeholder={translateText(["placeholders", "relatedTo"])}
      selectedValue={
        selectedCompany && selectedCompany.name ? selectedCompany.name : ""
      }
      onClear={handleClear}
      clearAriaLabel={translateAria(["clearRelatedTo"])}
      fieldAriaLabel={translateAria(["relatedTo"])}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={debouncedSearch.length > 0}
      emptyMessage={translateText(["emptyStates", "noCompanies"])}
    />
  );
};

export default LogCallCompanyField;
