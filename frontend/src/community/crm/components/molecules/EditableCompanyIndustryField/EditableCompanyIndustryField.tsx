import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import { characterLengths } from "~community/common/constants/stringConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetIndustryLookup } from "~community/crm/api/IndustryApi";
import AddNewOption from "~community/crm/components/atoms/AddNewOption/AddNewOption";
import { DEFAULT_LOOKUP_PAGE_SIZE } from "~community/crm/constants/commonConstants";
import { ADD_NEW_INDUSTRY_OPTION_ID } from "~community/crm/constants/companyConstants";
import { useIndustryNameMapper } from "~community/crm/hooks/useIndustryNameMapper";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmIndustryFilterRequest,
  CrmIndustryOption
} from "~community/crm/types/CrmTypes";
import {
  getIndustryOptions,
  updateIndustryRecord
} from "~community/crm/utils/companyUtil";

interface EditableCompanyIndustryFieldProps {
  industryId?: number | null;
  industryName?: string;
  canAddNewIndustry?: boolean;
  onSelect: (industryId: number) => void;
  onAddNew: (industryName: string) => void;
  onClear: () => void;
}

const EditableCompanyIndustryField: FC<EditableCompanyIndustryFieldProps> = ({
  industryId,
  industryName,
  canAddNewIndustry,
  onSelect,
  onAddNew,
  onClear
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");
  const { getIndustryByName } = useIndustryNameMapper();
  const [searchText, setSearchText] = useState("");

  const trimmedSearch = searchText.trim();
  const debouncedSearch = useDebounce(trimmedSearch, SEARCH_DEBOUNCE_DELAY);

  const { industries, setIndustries } = useCrmStore(
    useShallow((state) => ({
      industries: state.industries,
      setIndustries: state.setIndustries
    }))
  );

  const isSearching = industryId == null && !industryName;

  const industryLookupFilters: CrmIndustryFilterRequest = {
    searchKeyword: debouncedSearch,
    size: DEFAULT_LOOKUP_PAGE_SIZE
  };

  const { data: industryLookupData } = useGetIndustryLookup(
    industryLookupFilters,
    isSearching
  );

  const industryOptions = useMemo(
    () =>
      getIndustryOptions(
        industryLookupData?.items,
        getIndustryByName,
        canAddNewIndustry === true ? trimmedSearch : undefined
      ),
    [
      industryLookupData?.items,
      getIndustryByName,
      canAddNewIndustry,
      trimmedSearch
    ]
  );

  const renderOptionContent = (option: CrmIndustryOption) => {
    if (option.id === ADD_NEW_INDUSTRY_OPTION_ID) {
      return (
        <AddNewOption
          label={translateText(
            ["companies", "modal", "labels", "addNewIndustry"],
            {
              name: trimmedSearch
            }
          )}
        />
      );
    }

    return option.name;
  };

  const dropdownItems: SearchableDropdownItem[] = industryOptions.map(
    (option) => ({
      id: option.id,
      content: renderOptionContent(option)
    })
  );

  const handleSelect = (item: SearchableDropdownItem) => {
    if (item.id === ADD_NEW_INDUSTRY_OPTION_ID) {
      onAddNew(trimmedSearch);
      setSearchText("");
      return;
    }

    const industry = industryLookupData?.items.find(
      (lookupIndustry) => String(lookupIndustry.id) === item.id
    );
    if (industry) {
      setIndustries(updateIndustryRecord(industries, [industry]));
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
        id="company-industry"
        name="industry"
        label={translateText(["companies", "modal", "labels", "industry"])}
        placeholder={translateText([
          "companies",
          "modal",
          "placeholders",
          "industry"
        ])}
        items={dropdownItems}
        value={searchText}
        onChange={(event) =>
          setSearchText(
            event.target.value.slice(0, characterLengths.INDUSTRY_NAME_LENGTH)
          )
        }
        onSelect={handleSelect}
        onClose={() => setSearchText("")}
        emptyMessage={translateText([
          "companies",
          "modal",
          "emptyStates",
          "noIndustries"
        ])}
        isOpenOnFocus={true}
      />
    );
  }

  const selectedIndustry =
    industryId == null ? undefined : industries[industryId];

  const selectedName =
    industryName ??
    (selectedIndustry?.name
      ? getIndustryByName(selectedIndustry.name)
      : undefined);

  return (
    <InputField
      label={translateText(["companies", "modal", "labels", "industry"])}
      value={selectedName ?? ""}
      readOnly
      fullWidth
      variant="md"
      styleOverrides={{
        labelContainer:
          "h-6 inline-flex self-stretch pr-3 justify-start items-center gap-2"
      }}
      customStyles={{ gap: "gap-2" }}
      aria-label={translateAria(["companies", "modal", "industry"])}
      rightIcon={
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleClear}
          aria-label={translateAria(["companies", "modal", "clearIndustry"])}
          icon={<CloseIcon />}
        />
      }
    />
  );
};

export default EditableCompanyIndustryField;
