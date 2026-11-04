import { Chip } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityWarningTooltip from "~community/crm/components/atoms/ActivityWarningTooltip/ActivityWarningTooltip";
import { useContactLookup } from "~community/crm/hooks/useContactLookup";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmLogEmailFormValues,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";

interface Props {
  id: string;
  formik:
    FormikProps<CrmLogMeetingFormValues> | FormikProps<CrmLogEmailFormValues>;
  name: string;
  label: string;
  placeholder: string;
  groupAriaLabel: string;
  getRemoveAriaLabel: (name: string) => string;
  hiddenContactIds?: number[];
  warningTooltip?: string;
  required?: boolean;
  onContactsChange?: (nextContacts: CrmContactEntity[]) => void;
}

const ActivityContactsField: FC<Props> = ({
  id,
  formik,
  name,
  label,
  placeholder,
  groupAriaLabel,
  getRemoveAriaLabel,
  hiddenContactIds,
  warningTooltip,
  required,
  onContactsChange
}) => {
  const { getFieldProps, getFieldMeta, setFieldValue } = formik;

  const contactIds: number[] = getFieldProps(name).value;
  const { touched, error } = getFieldMeta(name);

  const translateText = useTranslator("crmModule", "activities", "logActivity");

  const { contacts, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const { isSearchActive, isLoading, lookupItems, dropdownItems } =
    useContactLookup(searchTerm);

  const visibleItems = dropdownItems.filter(
    (item) => !hiddenContactIds?.includes(Number(item.id))
  );

  const handleSelect = (item: SearchableDropdownItem): void => {
    const contact = lookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    setSearchTerm("");

    if (!contact?.id || contactIds.includes(contact.id)) return;

    setContacts(updateContactRecord(contacts, [contact]));
    setFieldValue(name, [...contactIds, contact.id], true);
    onContactsChange?.([
      ...contactIds.map((contactId) => contacts[contactId]),
      contact
    ]);
  };

  const handleRemove = (contactId: number): void => {
    const nextContactIds = contactIds.filter(
      (selectedId) => selectedId !== contactId
    );

    setFieldValue(name, nextContactIds, true);
    onContactsChange?.(
      nextContactIds.map((selectedId) => contacts[selectedId])
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <SearchableDropdown
        positionStrategy="fixed"
        id={id}
        items={visibleItems}
        onSelect={handleSelect}
        label={label}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        isOpenOnFocus={isSearchActive}
        emptyMessage={translateText(["emptyStates", "noContacts"])}
        {...(isLoading && {
          loadingMessage: translateText(["emptyStates", "searching"])
        })}
        state={touched && error ? "error" : "default"}
        {...(touched && error && { errorMessage: String(error) })}
        required={required}
      />

      {contactIds.length > 0 && (
        <fieldset
          aria-label={groupAriaLabel}
          className="flex min-w-0 flex-wrap gap-2"
        >
          {contactIds.map((contactId) => {
            const contactName = getContactDisplayName(contacts[contactId]);

            return (
              <Chip
                key={contactId}
                size="sm"
                label={contactName}
                onDelete={() => handleRemove(contactId)}
                ariaLabel={{ removeButton: getRemoveAriaLabel(contactName) }}
              />
            );
          })}
        </fieldset>
      )}

      {warningTooltip && (
        <ActivityWarningTooltip id={`${id}-warning`} text={warningTooltip} />
      )}
    </div>
  );
};

export default ActivityContactsField;
