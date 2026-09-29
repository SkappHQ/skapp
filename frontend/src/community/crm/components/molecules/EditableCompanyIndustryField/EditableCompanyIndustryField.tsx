import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ADD_NEW_INDUSTRY_OPTION_ID } from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmIndustryOption,
  getIndustryDisplayName,
  getIndustryOptions
} from "~community/crm/utils/companyUtil";

import AddNewIndustryOption from "./AddNewIndustryOption";

interface EditableCompanyIndustryFieldProps {
  industryId?: number | null;
  industryName?: string;
  onSelect: (industryId: number) => void;
  onAddNew: (industryName: string) => void;
  onClear: () => void;
}

const EditableCompanyIndustryField: FC<EditableCompanyIndustryFieldProps> = ({
  industryId,
  industryName,
  onSelect,
  onAddNew,
  onClear
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");
  const [searchText, setSearchText] = useState("");

  const trimmedSearch = searchText.trim();

  const { industries } = useCrmStore(
    useShallow((state) => ({
      industries: state.industries
    }))
  );

  const isSearching = industryId == null && !industryName;

  const industryOptions = useMemo(
    () => getIndustryOptions(industries, translateText, trimmedSearch),
    [industries, translateText, trimmedSearch]
  );

  const renderOptionContent = (option: CrmIndustryOption) => {
    if (option.id === ADD_NEW_INDUSTRY_OPTION_ID) {
      return (
        <AddNewIndustryOption
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
        onChange={(event) => setSearchText(event.target.value)}
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
    (selectedIndustry
      ? getIndustryDisplayName(selectedIndustry, translateText)
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
