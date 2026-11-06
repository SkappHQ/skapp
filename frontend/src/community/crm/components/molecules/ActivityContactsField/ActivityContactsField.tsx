import { MultiSelectSearch } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
  hiddenContactIds?: number[];
  warningTooltip?: string;
  required?: boolean;
  fillsRelatedTo?: boolean;
  actions?: ReactNode;
  onContactsChange?: (nextContacts: CrmContactEntity[]) => void;
}

const ActivityContactsField: FC<Props> = ({
  id,
  formik,
  name,
  label,
  placeholder,
  groupAriaLabel,
  hiddenContactIds,
  warningTooltip,
  required,
  fillsRelatedTo,
  actions,
  onContactsChange
}) => {
  const { values, getFieldProps, getFieldMeta, setFieldValue } = formik;

  const contactIds: number[] = getFieldProps(name).value;
  const { touched, error } = getFieldMeta(name);
  const isError = Boolean(touched && error);

  const translateText = useTranslator("crmModule", "activities", "logActivity");

  const { contacts, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [hasFilledRelatedTo, setHasFilledRelatedTo] = useState(false);

  const { isLoading, lookupItems } = useContactLookup(searchTerm);

  const options = lookupItems
    .filter((contact) => contact.id && !hiddenContactIds?.includes(contact.id))
    .map((contact) => ({
      id: Number(contact.id),
      label: getContactDisplayName(contact)
    }));

  const selectedOptions = contactIds.map((contactId) => ({
    id: contactId,
    label: getContactDisplayName(contacts[contactId])
  }));

  const handleContactsChange = (nextContactIds: number[]): void => {
    const addedContact = lookupItems.find(
      (contact) =>
        contact.id &&
        nextContactIds.includes(contact.id) &&
        !contactIds.includes(contact.id)
    );

    if (addedContact) {
      setContacts(updateContactRecord(contacts, [addedContact]));
    }

    setFieldValue(name, nextContactIds, true);
    onContactsChange?.(
      nextContactIds.map((contactId) =>
        addedContact?.id === contactId ? addedContact : contacts[contactId]
      )
    );

    if (
      fillsRelatedTo &&
      addedContact &&
      !hasFilledRelatedTo &&
      !values.companyId &&
      addedContact.companyId
    ) {
      setFieldValue("companyId", addedContact.companyId);
      setHasFilledRelatedTo(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`${id}-input`}
        className={`subtitle1 leading-normal ${isError ? "text-semantic-red-accent" : "text-black"}`}
      >
        {label}
        {required && (
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="flex flex-row items-center gap-6">
        <div className="min-w-0 flex-1">
          <MultiSelectSearch
            searchInputId={`${id}-input`}
            options={options}
            selectedOptions={selectedOptions}
            onOptionSelect={(nextOptions) =>
              handleContactsChange(
                nextOptions.map((option) => Number(option.id))
              )
            }
            searchText={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={placeholder}
            ariaLabel={groupAriaLabel}
            emptyResultsMessage={translateText([
              "emptyStates",
              isLoading ? "searching" : "noContacts"
            ])}
            showClearAllButton={false}
          />
        </div>
        {actions}
      </div>

      {isError && (
        <p
          className="body3 leading-none text-semantic-red-accent"
          role="alert"
          aria-live="assertive"
        >
          {String(error)}
        </p>
      )}

      {warningTooltip && (
        <ActivityWarningTooltip id={`${id}-warning`} text={warningTooltip} />
      )}
    </div>
  );
};

export default ActivityContactsField;
