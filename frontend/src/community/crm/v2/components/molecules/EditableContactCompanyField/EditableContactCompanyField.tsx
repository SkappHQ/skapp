import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  useGetCompanyLookup,
  useSearchCompaniesByDomain
} from "~community/crm/v2/api/CompanyApi";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/v2/constants/commonConstants";
import { ADD_NEW_COMPANY_OPTION_ID } from "~community/crm/v2/constants/contactConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmCompanyFilterRequest } from "~community/crm/v2/types/CrmTypes";
import {
  getCompanyById,
  updateCompanyRecord
} from "~community/crm/v2/utils/companyUtil";
import {
  CrmCompanyOption,
  getCompanyOptions
} from "~community/crm/v2/utils/contactUtil";

import AddNewCompanyOption from "./AddNewCompanyOption";
import SuggestedBadge from "./SuggestedBadge";

interface EditableContactCompanyFieldProps {
  companyId?: number | null;
  companyName?: string;
  suggestedDomain: string;
  translateText: TranslatorFunctionType;
  canAddNewCompany?: boolean;
  onSelect: (companyId: number) => void;
  onAddNew: (companyName: string) => void;
  onClear: () => void;
}

const EditableContactCompanyField: FC<EditableContactCompanyFieldProps> = ({
  companyId,
  companyName,
  suggestedDomain,
  translateText,
  canAddNewCompany,
  onSelect,
  onAddNew,
  onClear
}) => {
  const [searchText, setSearchText] = useState("");

  const trimmedSearch = searchText.trim();
  const debouncedSearch = useDebounce(trimmedSearch, SEARCH_DEBOUNCE_DELAY);

  const { companies, setCompanies } = useCrmStoreV2(
    useShallow((state) => ({
      companies: state.companies,
      setCompanies: state.setCompanies
    }))
  );

  const isSearching = companyId == null && !companyName;

  const companyLookupFilters: CrmCompanyFilterRequest = {
    searchKeyword: debouncedSearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const { data: companyLookupData } = useGetCompanyLookup(
    companyLookupFilters,
    isSearching
  );

  const { data: domainSearchData } = useSearchCompaniesByDomain(
    suggestedDomain,
    isSearching && suggestedDomain.length > 0
  );

  const companyOptions = useMemo(
    () =>
      getCompanyOptions(
        companyLookupData?.items,
        domainSearchData?.companies,
        canAddNewCompany === true ? trimmedSearch : undefined
      ),
    [
      companyLookupData?.items,
      domainSearchData?.companies,
      canAddNewCompany,
      trimmedSearch
    ]
  );

  const renderOptionContent = (option: CrmCompanyOption) => {
    if (option.id === ADD_NEW_COMPANY_OPTION_ID) {
      return (
        <AddNewCompanyOption
          label={translateText(["labels", "addNewCompany"], {
            companyName: trimmedSearch
          })}
        />
      );
    }

    if (option.isSuggested) {
      return (
        <SuggestedBadge label={translateText(["labels", "suggested"])}>
          {option.name}
        </SuggestedBadge>
      );
    }

    return option.name;
  };

  const dropdownItems: SearchableDropdownItem[] = companyOptions.map(
    (option) => ({
      id: option.id,
      content: renderOptionContent(option)
    })
  );

  const findCompany = (id: string): CrmCompanyEntity | undefined =>
    companyLookupData?.items.find((company) => String(company.id) === id) ??
    domainSearchData?.companies.find((company) => String(company.id) === id);

  const handleSelect = (item: SearchableDropdownItem) => {
    if (item.id === ADD_NEW_COMPANY_OPTION_ID) {
      onAddNew(trimmedSearch);
      setSearchText("");
      return;
    }

    const company = findCompany(item.id);
    if (company) {
      setCompanies(updateCompanyRecord(companies, [company]));
    }

    onSelect(Number(item.id));
    setSearchText("");
  };

  const handleClear = () => {
    onClear();
    setSearchText("");
  };

  if (isSearching) {
    return (
      <SearchableDropdown
        id="contact-company"
        name="company"
        label={translateText(["labels", "company"])}
        placeholder={translateText(["placeholders", "company"])}
        items={dropdownItems}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        onSelect={handleSelect}
        onClose={() => setSearchText("")}
        isOpenOnFocus={true}
      />
    );
  }

  const selectedName =
    companyName ??
    (companyId == null
      ? undefined
      : getCompanyById(companies, companyId)?.name);

  return (
    <InputField
      label={translateText(["labels", "company"])}
      value={selectedName ?? ""}
      readOnly
      fullWidth
      variant="md"
      styleOverrides={{
        labelContainer:
          "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
      }}
      customStyles={{ gap: "gap-2" }}
      aria-label={translateText(["ariaLabels", "company"])}
      rightIcon={
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleClear}
          aria-label={translateText(["ariaLabels", "clearCompany"])}
          icon={<CloseIcon />}
        />
      }
    />
  );
};

export default EditableContactCompanyField;
