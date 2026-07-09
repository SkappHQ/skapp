import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmContactLookup } from "~community/crm/types/CommonTypes";
import { findById } from "~community/crm/utils/crmUtil";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  noResultsText: string;
  ariaLabel?: string;
  clearAriaLabel?: string;
  isInvalid?: boolean;
}

const AddDealContactSearch: FC<Props> = ({
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    onSearch(e.target.value);
  };

  const handleSelect = (item: SearchableDropdownItem) => {
    const contact = findById(contacts, Number(item.id), (c) => c.id);
    onChange(contact);
    resetSearch();
  };

  const handleClear = () => {
    onChange(null);
    resetSearch();
  };

  if (selectedContact) {
    return (
      <InputField
        variant="sm"
        value={selectedContact.name}
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
    content: contact.name
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
