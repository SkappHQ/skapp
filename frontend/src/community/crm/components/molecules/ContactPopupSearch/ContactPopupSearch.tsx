import type {
  DropdownOption,
  TriggerProps
} from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import { FC, RefObject } from "react";

import EntityPopupSearch from "~community/crm/components/molecules/EntityPopupSearch/EntityPopupSearch";
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

const getContactId = (c: CrmContactLookup) => c.id;
const getContactLabel = (c: CrmContactLookup) => c.name;

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid
}) => (
  <EntityPopupSearch
    items={contacts}
    selectedItem={selectedContact}
    getItemId={getContactId}
    getItemLabel={getContactLabel}
    onChange={onChange}
    onSearch={onSearch}
    placeholder={placeholder}
    searchPlaceholder={searchPlaceholder}
    noResultsText={noResultsText}
    ariaInvalid={ariaInvalid}
    renderTrigger={(contact: CrmContactLookup | null, { ref, ...triggerProps }: TriggerProps) => (
      <div
        ref={ref as RefObject<HTMLDivElement>}
        {...triggerProps}
        className="flex items-center w-full min-h-8 cursor-pointer"
      >
        {contact ? (
          <span className="body2">{contact.name}</span>
        ) : (
          <span className="body2 text-tertiary-text">{placeholder}</span>
        )}
      </div>
    )}
    renderOption={(contact: CrmContactLookup, option: DropdownOption, onSelect) => (
      <button
        key={option.id}
        type="button"
        className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer w-full text-left"
        onClick={() => onSelect(option)}
      >
        {contact.name}
      </button>
    )}
  />
);

export default ContactPopupSearch;
