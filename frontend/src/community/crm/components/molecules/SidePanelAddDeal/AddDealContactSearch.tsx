import { SearchIcon, TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import { CrmContactLookup } from "~community/crm/types/CommonTypes";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaLabel?: string;
}

const AddDealContactSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaLabel
}) => {
  const renderPillTrigger = (
    contact: CrmContactLookup | null,
    triggerProps: TriggerProps
  ) => (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent bg-secondary-background px-3 py-2.5 cursor-pointer"
      {...triggerProps}
      ref={triggerProps?.ref as RefObject<HTMLButtonElement> | undefined}
    >
      <span
        className={`body2 leading-normal truncate ${contact?.name ? "" : "text-secondary-text"}`}
      >
        {contact?.name ?? placeholder}
      </span>
      <span className="shrink-0 text-secondary-text" aria-hidden="true">
        <SearchIcon width="16" height="16" />
      </span>
    </button>
  );

  return (
    <ContactPopupSearch
      contacts={contacts}
      selectedContact={selectedContact}
      onChange={onChange}
      onSearch={onSearch}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      noResultsText={noResultsText}
      ariaLabel={ariaLabel}
      width="w-full"
      renderTrigger={renderPillTrigger}
    />
  );
};

export default AddDealContactSearch;
