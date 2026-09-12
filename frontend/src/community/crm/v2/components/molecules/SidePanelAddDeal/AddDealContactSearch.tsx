import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem,
  SearchableDropdownProps
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface AddDealContactSearchProps extends Pick<
  SearchableDropdownProps,
  "id" | "placeholder" | "emptyMessage" | "state" | "errorMessage"
> {
  contacts: CrmContactEntity[];
  selectedContact?: CrmContactEntity;
  onChange: (contact?: CrmContactEntity) => void;
  onSearch: (term: string) => void;
  ariaLabel?: string;
  clearAriaLabel?: string;
}

const AddDealContactSearch: FC<AddDealContactSearchProps> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  ariaLabel,
  clearAriaLabel,
  ...dropdownProps
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
      variant="sm"
      required
      isOpenOnFocus
      {...dropdownProps}
      value={searchText}
      onChange={handleSearchChange}
      items={contactItems}
      onSelect={handleSelect}
    />
  );
};

export default AddDealContactSearch;
