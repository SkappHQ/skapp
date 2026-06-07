import {
  DropdownValue,
  DropdownWithSearchablePopup
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  ariaInvalid?: boolean;
}

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  ariaInvalid
}) => {
  const options: DropdownOption[] = contacts.map((c) => ({
    id: c.id,
    value: c.id,
    label: c.name
  }));

  const selectedValue: DropdownOption | null = selectedContact
    ? {
        id: selectedContact.id,
        value: selectedContact.id,
        label: selectedContact.name
      }
    : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const id = typeof val === "object" ? Number(val.id) : Number(val);
    const contact = contacts.find((c) => c.id === id) ?? null;
    onChange(contact);
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedValue}
      onChange={handleChange}
      onSearch={onSearch}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchable
      clearable
      ariaInvalid={ariaInvalid}
      width="100%"
      renderOption={(option, _index, onSelect) => {
        const opt = option as DropdownOption;
        return (
          <button
            type="button"
            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer w-full text-left"
            onClick={() => onSelect(option)}
          >
            {typeof opt.label === "string" ? opt.label : ""}
          </button>
        );
      }}
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-gray-400">No results</div>
      )}
    />
  );
};

export default ContactPopupSearch;
