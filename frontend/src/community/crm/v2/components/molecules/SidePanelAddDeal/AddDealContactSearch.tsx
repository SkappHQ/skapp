import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface AddDealContactSearchProps {
  id: string;
  contacts: CrmContactEntity[];
  selectedContact?: CrmContactEntity;
  onChange: (contact?: CrmContactEntity) => void;
  onSearch: (term: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  state?: "default" | "error";
  errorMessage?: string;
  ariaLabel?: string;
  clearAriaLabel?: string;
}

const AddDealContactSearch: FC<AddDealContactSearchProps> = ({
  id,
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  emptyMessage,
  state,
  errorMessage,
  ariaLabel,
  clearAriaLabel
}) => {
  const [searchText, setSearchText] = useState("");

  const resetSearch = () => {
    setSearchText("");
    onSearch("");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    onSearch(event.target.value);
  };

  const handleSelect = (item: SearchableDropdownItem) => {
    const contact = contacts.find((option) => String(option.id) === item.id);

    if (!contact) {
      return;
    }

    onChange(contact);
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
      id={id}
      variant="sm"
      required
      isOpenOnFocus
      placeholder={placeholder}
      emptyMessage={emptyMessage}
      state={state}
      errorMessage={errorMessage}
      value={searchText}
      onChange={handleSearchChange}
      items={contactItems}
      onSelect={handleSelect}
    />
  );
};

export default AddDealContactSearch;
