import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  SearchIcon,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, RefObject, useMemo } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";
import { findById } from "~community/crm/utils/crmUtil";
import { buildContactOptions } from "~community/crm/utils/dealUtil";

import ContactOptionItem from "../ContactPopupSearch/ContactOptionItem";

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
  const getContactId = (contact: CrmContactLookup) => contact.id;

  const options: DropdownOption[] = useMemo(
    () => buildContactOptions(contacts),
    [contacts]
  );

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
    const contact = findById(contacts, Number(id), getContactId);
    onChange(contact);
  };

  const handleRenderTrigger = (
    option: DropdownOption | null,
    triggerProps: TriggerProps
  ) => {
    const selected = selectedContact ?? null;
    const contact = option
      ? (findById(contacts, Number(option.id), getContactId) ?? selected)
      : null;

    return (
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
  };

  const handleRenderOption = (
    option: DropdownOption,
    onSelect: (value: DropdownValue) => void
  ) => {
    const contact = findById(contacts, Number(option.id), getContactId);

    return contact ? (
      <ContactOptionItem
        key={option.id}
        contact={contact}
        option={option}
        onSelect={onSelect}
      />
    ) : null;
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
      ariaLabel={ariaLabel}
      width="w-full"
      renderTrigger={(option, _a, _b, triggerProps) =>
        handleRenderTrigger(option as DropdownOption | null, triggerProps)
      }
      renderOption={(option, _index, onSelect) =>
        handleRenderOption(option as DropdownOption, onSelect)
      }
      renderNoResults={() => (
        <div className="px-4 py-2 text-sm text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
};

export default AddDealContactSearch;
