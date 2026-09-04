import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import {
  CrmCompanyRecord,
  CrmContactEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { getCompanyById } from "~community/crm/v2/utils/companyUtil";
import {
  buildContactOptions,
  getContactDisplayName
} from "~community/crm/v2/utils/contactUtil";

import ContactOptionItem from "./ContactOptionItem";
import ContactTriggerContent from "./ContactTriggerContent";

interface Props {
  contacts: CrmContactEntity[];
  companies: CrmCompanyRecord;
  selectedContact: CrmContactEntity | null;
  onChange: (contact: CrmContactEntity | null) => void;
  onSearch: (searchTerm: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
}

const ContactPopupSearch: FC<Props> = ({
  contacts,
  companies,
  selectedContact,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  noResultsText,
  ariaInvalid,
  ariaRequired
}) => {
  const companyNameOf = (contact: CrmContactEntity): string | undefined =>
    contact.companyId != null
      ? getCompanyById(companies, contact.companyId)?.name
      : undefined;

  const dropdownOptions: DropdownOption[] = useMemo(
    () => buildContactOptions(contacts, companies),
    [contacts, companies]
  );

  const selectedValue: DropdownOption | null =
    selectedContact?.id != null
      ? {
          id: selectedContact.id,
          value: selectedContact.id,
          label: getContactDisplayName(selectedContact)
        }
      : null;

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const { id } = val as DropdownOption;
    onChange(contacts.find((contact) => contact.id === Number(id)) ?? null);
  };

  const handleRenderTrigger = (triggerProps: TriggerProps) => (
    <ContactTriggerContent
      name={
        selectedContact ? getContactDisplayName(selectedContact) : undefined
      }
      companyName={selectedContact ? companyNameOf(selectedContact) : undefined}
      placeholder={placeholder}
      triggerProps={triggerProps}
    />
  );

  const handleRenderOption = (
    option: DropdownOption,
    onSelect: (value: DropdownValue) => void
  ) => {
    const contact =
      contacts.find((contact) => contact.id === Number(option.id)) ?? null;

    return contact ? (
      <ContactOptionItem
        key={option.id}
        contact={contact}
        companyName={companyNameOf(contact)}
        option={option}
        onSelect={onSelect}
      />
    ) : null;
  };

  return (
    <DropdownWithSearchablePopup
      options={dropdownOptions}
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
        <div className="px-4 py-2 body2 text-tertiary-text">
          {noResultsText}
        </div>
      )}
    />
  );
};

export default ContactPopupSearch;
