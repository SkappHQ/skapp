import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, RefObject, useMemo } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
}

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid
}) => {
  const options: DropdownOption[] = useMemo(() => {
    const mapped = contacts.map((c) => ({
      id: c.id,
      value: c.id,
      label: c.name
    }));
    if (selectedContact && !contacts.some((c) => c.id === selectedContact.id)) {
      return [
        {
          id: selectedContact.id,
          value: selectedContact.id,
          label: selectedContact.name
        },
        ...mapped
      ];
    }
    return mapped;
  }, [contacts, selectedContact]);

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
    const { id } = val as DropdownOption;
    const contact =
      contacts.find((c) => c.id === id) ??
      (selectedContact?.id === id ? selectedContact : null);
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
      renderTrigger={(
        _val: DropdownValue | null,
        _isOpen: boolean,
        _disabled: boolean,
        { ref, ...triggerProps }: TriggerProps
      ) => (
        <div
          ref={ref as RefObject<HTMLDivElement>}
          {...triggerProps}
          className="flex items-center w-full min-h-8 cursor-pointer"
        >
          {selectedContact ? (
            <span className="body2">{selectedContact.name}</span>
          ) : (
            <span className="body2 text-tertiary-text">{placeholder}</span>
          )}
        </div>
      )}
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
};

export default ContactPopupSearch;
