import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useMemo } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";
import { findById } from "~community/crm/utils/crmUtil";
import { buildContactOptions } from "~community/crm/utils/dealUtil";

import ContactOptionItem from "./ContactOptionItem";
import ContactTriggerContent from "./ContactTriggerContent";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
  ariaLabel?: string;
  width?: string;
  renderTrigger?: (
    contact: CrmContactLookup | null,
    triggerProps: TriggerProps
  ) => ReactNode;
}

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid,
  ariaRequired,
  ariaLabel,
  width = "w-full",
  renderTrigger
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
    if (renderTrigger) {
      return renderTrigger(selectedContact, triggerProps);
    }

    const contact = findById(contacts, Number(option?.id), getContactId);

    if (contact && option) {
      return (
        <ContactTriggerContent
          key={option.id}
          contact={contact}
          triggerProps={triggerProps}
        />
      );
    }

    return (
      <ContactTriggerContent
        placeholder={placeholder}
        triggerProps={triggerProps}
      />
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
      ariaInvalid={ariaInvalid}
      ariaRequired={ariaRequired}
      ariaLabel={ariaLabel}
      width={width}
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

export default ContactPopupSearch;
