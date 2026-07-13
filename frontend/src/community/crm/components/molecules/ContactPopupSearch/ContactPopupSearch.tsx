import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC,useMemo } from "react";

import {
  CrmContactLookup,
  CrmDealContactType
} from "~community/crm/types/CommonTypes";
import { findById } from "~community/crm/utils/crmUtil";
import { buildContactOptions } from "~community/crm/utils/dealUtil";

import ContactOptionItem from "./ContactOptionItem";
import ContactTriggerContent from "./ContactTriggerContent";

interface Props {
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | CrmDealContactType | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
}

// Normalizes the deal's flat contact fields into the CrmContactLookup shape
// so the rest of this component only ever deals with one shape. company.id
// is a placeholder here — nothing downstream reads it, only company.name is shown.
const normalizeSelectedContact = (
  contact: CrmContactLookup | CrmDealContactType | null
): CrmContactLookup | null => {
  if (!contact) return null;
  if (!("contactId" in contact)) return contact;
  return {
    id: contact.contactId,
    name: contact.contactName,
    company: contact.companyName ? { id: 0, name: contact.companyName } : null
  };
};

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact: rawSelectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid,
  ariaRequired
}) => {
  const selectedContact = normalizeSelectedContact(rawSelectedContact);

  const getContactId = (contact: CrmContactLookup) => contact.id;

  const options: DropdownOption[] = useMemo(
    () => buildContactOptions(contacts, selectedContact),
    [contacts, selectedContact]
  );

  const resolveContact = (id: number): CrmContactLookup | null =>
    findById(contacts, id, getContactId) ??
    (selectedContact?.id === id ? selectedContact : null);

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
    onChange(resolveContact(Number(id)));
  };

  const handleRenderTrigger = (triggerProps: TriggerProps) => (
    <ContactTriggerContent
      name={selectedContact?.name}
      companyName={selectedContact?.company?.name}
      placeholder={placeholder}
      triggerProps={triggerProps}
    />
  );

  const handleRenderOption = (
    option: DropdownOption,
    onSelect: (value: DropdownValue) => void
  ) => {
    const contact = resolveContact(Number(option.id));

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
      width="w-full"
      renderTrigger={(_option, _isOpen, _disabled, triggerProps) =>
        handleRenderTrigger(triggerProps)
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
