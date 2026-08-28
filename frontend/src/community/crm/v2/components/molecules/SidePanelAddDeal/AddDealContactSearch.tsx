import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface AddDealContactSearchProps {
  contacts: CrmContactEntity[];
  selectedContact?: CrmContactEntity;
  onChange: (contact?: CrmContactEntity) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  noResultsText: string;
  ariaLabel?: string;
  clearAriaLabel?: string;
  isInvalid?: boolean;
}

const AddDealContactSearch: FC<AddDealContactSearchProps> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  noResultsText,
  ariaLabel,
  clearAriaLabel,
  isInvalid = false
}) => {
  const [searchText, setSearchText] = useState("");

  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const resetSearch = () => {
    setSearchText("");
    onSearch("");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    onSearch(event.target.value);
  };

  const handleSelect = (item: SearchableDropdownItem) => {
    onChange(contacts.find((contact) => String(contact.id) === item.id));
    resetSearch();
  };

  const handleClear = () => {
    onChange(undefined);
    resetSearch();
  };

  if (selectedContact) {
    return (
      <InputField
        variant="sm"
        value={getContactDisplayName(selectedContact)}
        readOnly
        fullWidth
        aria-label={ariaLabel}
        rightIcon={
          <ButtonV2
            variant="tertiary"
            type="button"
            onClick={handleClear}
            aria-label={clearAriaLabel}
            icon={<CloseIcon />}
          />
        }
      />
    );
  }

  const contactItems: SearchableDropdownItem[] = contacts.map((contact) => ({
    id: String(contact.id),
    content: getContactDisplayName(contact)
  }));

  return (
    <SearchableDropdown
      id="add-deal-contact-search"
      variant="sm"
      placeholder={placeholder}
      value={searchText}
      onChange={handleSearchChange}
      items={contactItems}
      onSelect={handleSelect}
      emptyMessage={noResultsText}
      state={isInvalid ? "error" : "default"}
      required
      isOpenOnFocus={true}
      errorMessage={translateText([
        "inlineAddDeal",
        "validations",
        "contactRequired"
      ])}
    />
  );
};

export default AddDealContactSearch;
