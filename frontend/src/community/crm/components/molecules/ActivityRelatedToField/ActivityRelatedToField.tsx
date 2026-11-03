import { FormikProps } from "formik";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCompaniesByIds,
  useGetCompanyLookup
} from "~community/crm/api/CompanyApi";
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
import { CrmCompanyFilterRequest } from "~community/crm/types/CrmTypes";
import {
  getMissingCompanyIds,
  updateCompanyRecord
} from "~community/crm/utils/companyUtil";

interface Props {
  id: string;
  formik:
    FormikProps<CrmLogCallFormValues> | FormikProps<CrmLogMeetingFormValues>;
  fieldAriaLabel: string;
}

const ActivityRelatedToField: FC<Props> = ({ id, formik, fieldAriaLabel }) => {
  const { values, setFieldValue } = formik;

  const translateText = useTranslator("crmModule", "activities", "logActivity");
  const translateAria = useTranslator("crmAria", "activities", "logActivity");

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

  const missingCompanyIds = useMemo(
    () =>
      values.companyId
        ? getMissingCompanyIds([values.companyId], companies)
        : [],
    [values.companyId, companies]
  );
  const { data: fetchedCompanies } = useGetCompaniesByIds(
    missingCompanyIds,
    missingCompanyIds.length > 0
  );
  useEffect(() => {
    if (fetchedCompanies && fetchedCompanies.length > 0) {
      setCompanies(updateCompanyRecord(companies, fetchedCompanies));
    }
  }, [fetchedCompanies]);

  const selectedCompany = values.companyId ? companies[values.companyId] : null;

  const handleSelect = (item: SearchableDropdownItem): void => {
    const company = lookupItems.find(
      (lookupCompany) => String(lookupCompany.id) === item.id
    );
    setSearchTerm("");

    if (!company?.id) return;

    setCompanies(updateCompanyRecord(companies, [company]));
    setFieldValue("companyId", company.id);
  };

  const handleClear = (): void => {
    setFieldValue("companyId", null);
    setSearchTerm("");
  };

  return (
    <SelectableSearchField
      positionStrategy="fixed"
      id={id}
      label={translateText(["labels", "relatedTo"])}
      placeholder={translateText(["placeholders", "relatedTo"])}
      selectedValue={selectedCompany?.name ? selectedCompany.name : ""}
      onClear={handleClear}
      clearAriaLabel={translateAria(["clearRelatedTo"])}
      fieldAriaLabel={fieldAriaLabel}
      searchValue={searchTerm}
      onSearchChange={(event) => setSearchTerm(event.target.value)}
      items={dropdownItems}
      onSelect={handleSelect}
      isOpenOnFocus={debouncedSearch.length > 0}
      emptyMessage={translateText(["emptyStates", "noCompanies"])}
    />
  );
};

export default ActivityRelatedToField;
