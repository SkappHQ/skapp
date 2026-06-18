import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";
import {
  findById,
  toDropdownOptions,
  toSelectedDropdownOption
} from "~community/crm/utils/crmUtil";

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
  const getId = (c: CrmContactLookup) => c.id;
  const getLabel = (c: CrmContactLookup) => c.name;

  const options = toDropdownOptions(contacts, getId, getLabel);
  const selectedValue = toSelectedDropdownOption(selectedContact, getId, getLabel);

  const handleChange = (val: DropdownValue | null) => {
    if (!val) {
      onChange(null);
      return;
    }
    const { id } = val as DropdownOption;
    onChange(findById(contacts, id, getId));
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
