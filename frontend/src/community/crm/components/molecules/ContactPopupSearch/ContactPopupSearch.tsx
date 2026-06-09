import { DropdownWithSearchablePopup } from "@rootcodelabs/skapp-ui";
import type {
  DropdownOption,
  DropdownValue,
  TriggerProps
} from "@rootcodelabs/skapp-ui/dist/types/components/molecules/DropdownWithSearchablePopup/DropdownWithSearchablePopup";
import React, { FC, useMemo, useState } from "react";

import { CrmContactType } from "~community/crm/types/CommonTypes";

interface Props {
  contacts: CrmContactType[];
  selectedContact: CrmContactType | null;
  onChange: (contact: CrmContactType | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaInvalid?: boolean;
  ariaErrorMessage?: string;
}

const ContactPopupSearch: FC<Props> = ({
  contacts,
  selectedContact,
  onChange,
  placeholder,
  searchPlaceholder,
  ariaInvalid,
  ariaErrorMessage
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const options = useMemo<DropdownOption[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = term
      ? contacts.filter((c) => c.name.toLowerCase().includes(term))
      : contacts;
    return list.map((c) => ({
      id: String(c.id),
      value: String(c.id),
      label: c.name
    }));
  }, [contacts, searchTerm]);

  const selectedOption = useMemo<DropdownOption | null>(
    () =>
      selectedContact
        ? {
            id: String(selectedContact.id),
            value: String(selectedContact.id),
            label: selectedContact.name
          }
        : null,
    [selectedContact]
  );

  const handleChange = (v: DropdownValue | null) => {
    if (!v) {
      onChange(null);
      return;
    }
    const id =
      typeof v === "object" ? String((v as DropdownOption).id) : String(v);
    onChange(contacts.find((c) => String(c.id) === id) ?? null);
  };

  const renderTrigger = (
    _value: DropdownValue | null,
    _isOpen: boolean,
    _disabled: boolean,
    triggerProps: TriggerProps
  ) => {
    const { ref, onKeyDown, ...rest } = triggerProps;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="button"
        tabIndex={0}
        onKeyDown={
          onKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>
        }
        className={`text-[14px] cursor-pointer hover:bg-gray-50 rounded-lg w-full pl-1 ${
          selectedContact ? "text-[#111827]" : "text-[#9CA3AF]"
        }`}
        {...rest}
      >
        {selectedContact ? selectedContact.name : placeholder}
      </div>
    );
  };

  const renderOption = (
    option: DropdownValue,
    _index: number,
    onSelect: (o: DropdownValue) => void
  ) => {
    const id =
      typeof option === "object"
        ? String((option as DropdownOption).id)
        : String(option);
    const label =
      typeof option === "object"
        ? String((option as DropdownOption).label)
        : String(option);

    return (
      <div
        key={id}
        role="option"
        tabIndex={0}
        aria-selected={
          selectedContact ? String(selectedContact.id) === id : false
        }
        className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-[14px] text-[#111827]"
        onClick={() => onSelect(option)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(option);
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <DropdownWithSearchablePopup
      options={options}
      value={selectedOption}
      onChange={handleChange}
      onSearch={setSearchTerm}
      searchable
      clearable
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      width="w-full"
      popupWidth="w-56"
      renderTrigger={renderTrigger}
      renderOption={renderOption}
      ariaInvalid={ariaInvalid}
      ariaErrorMessage={ariaErrorMessage}
    />
  );
};

export default ContactPopupSearch;
