import { MultiSelectSearchDropdown } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, ReactNode, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useContactLookup } from "~community/crm/hooks/useContactLookup";
import { useRelatedToAutoFill } from "~community/crm/hooks/useRelatedToAutoFill";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmLogEmailFormValues,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  toContactOption,
  updateContactRecord
} from "~community/crm/utils/contactUtil";
import { CrmScheduleMeetingFormValues } from "~enterprise/crm/types/ScheduleMeetingTypes";

interface Props {
  id: string;
  formik:
    | FormikProps<CrmLogMeetingFormValues>
    | FormikProps<CrmLogEmailFormValues>
    | FormikProps<CrmScheduleMeetingFormValues>;
  name: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  groupAriaLabel: string;
  hiddenContactIds?: number[];
  warningMessage?: string;
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
  searchPlaceholder,
  groupAriaLabel,
  hiddenContactIds,
  warningMessage,
  required,
  fillsRelatedTo,
  actions,
  onContactsChange
}) => {
  const { getFieldProps, getFieldMeta, setFieldValue } = formik;

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
  const [hasMenuOpened, setHasMenuOpened] = useState(false);
  const [pinnedContactIds, setPinnedContactIds] = useState<number[]>([]);

  const { isSearchActive, lookupItems } = useContactLookup(
    searchTerm,
    hasMenuOpened
  );

  const fillRelatedToFromContact = useRelatedToAutoFill(formik, fillsRelatedTo);

  const handleMenuOpen = (): void => {
    setPinnedContactIds(contactIds);
    setHasMenuOpened(true);
  };

  const lookupContacts = lookupItems.filter(
    (contact) => contact.id && !hiddenContactIds?.includes(contact.id)
  );

  const pinnedOptions = isSearchActive
    ? lookupContacts
        .filter((contact) => pinnedContactIds.includes(Number(contact.id)))
        .map((contact) => toContactOption(Number(contact.id), contact))
    : pinnedContactIds.map((contactId) =>
        toContactOption(contactId, contacts[contactId])
      );

  const options = [
    ...pinnedOptions,
    ...lookupContacts
      .filter((contact) => !pinnedContactIds.includes(Number(contact.id)))
      .map((contact) => toContactOption(Number(contact.id), contact))
  ];

  const handleContactsChange = (nextValues: string[]): void => {
    const nextContactIds = nextValues.map(Number);

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

    if (addedContact) {
      fillRelatedToFromContact(addedContact);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        className={`subtitle1 leading-normal ${isError ? "text-semantic-red-accent" : "text-black"}`}
      >
        {label}
        {required && (
          <span className="ml-1 text-semantic-red-accent" aria-hidden="true">
            *
          </span>
        )}
      </span>

      <div className="flex flex-row items-center gap-6">
        <div className="min-w-0 flex-1">
          <MultiSelectSearchDropdown
            id={id}
            options={options}
            selectedValues={contactIds.map(String)}
            onChange={handleContactsChange}
            onSearchChange={setSearchTerm}
            onOpen={handleMenuOpen}
            searchInputProps={{
              id: `${id}-search`,
              placeholder: searchPlaceholder
            }}
            isSearchVisible
            ariaLabel={groupAriaLabel}
            ariaRequired={required}
            isError={isError}
            texts={{
              placeholder,
              selectedCount: translateText(["placeholders", "selectedCount"]),
              noOptions: translateText(["emptyStates", "noContacts"])
            }}
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

      {warningMessage && (
        <output
          id={`${id}-warning`}
          className="text-sm text-semantic-amber-text"
        >
          {warningMessage}
        </output>
      )}
    </div>
  );
};

export default ActivityContactsField;
