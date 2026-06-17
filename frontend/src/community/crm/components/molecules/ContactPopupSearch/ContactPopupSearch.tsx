import { TriggerProps } from "@rootcodelabs/skapp-ui";
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
    getItemId={(c: CrmContactLookup) => c.id}
    getItemLabel={(c: CrmContactLookup) => c.name}
    onChange={onChange}
    onSearch={onSearch}
    placeholder={placeholder}
    searchPlaceholder={searchPlaceholder}
    noResultsText={noResultsText}
    ariaInvalid={ariaInvalid}
    renderTrigger={(
      contact: CrmContactLookup | null,
      { ref, ...triggerProps }: TriggerProps
    ) => (
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
  />
);

export default ContactPopupSearch;
