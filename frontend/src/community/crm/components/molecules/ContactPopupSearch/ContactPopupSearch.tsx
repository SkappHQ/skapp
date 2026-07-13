import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

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
  selectedContact: CrmDealContactType | null;
  onChange: (contact: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
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
  ariaRequired
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
    onChange(findById(contacts, Number(id), getContactId));
  };

  const handleRenderTrigger = (triggerProps: TriggerProps) => (
    <ContactTriggerContent
      name={selectedContact?.name}
      companyName={selectedContact?.companyName}
      placeholder={placeholder}
      triggerProps={triggerProps}
    />
  );

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
