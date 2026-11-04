import {
  AvatarChipsInput,
  AvatarChipsInputResult
} from "@rootcodelabs/skapp-ui";
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
  const translateAria = useTranslator("crmAria", "activities", "logActivity");

  const { contacts, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [hasFilledRelatedTo, setHasFilledRelatedTo] = useState(false);

  const { lookupItems } = useContactLookup(searchTerm);

  const toChip = (contact: CrmContactEntity): AvatarChipsInputResult => {
    const contactName = getContactDisplayName(contact);
    const [firstName, lastName] = contactName.split(" ");

    return {
      type: "contact",
      optionId: Number(contact.id),
      chipContent: {
        label: contactName,
        avatarProps: { id: `${id}-${contact.id}`, firstName, lastName }
      }
    };
  };

  const selectedChips = contactIds.map((contactId) =>
    toChip(contacts[contactId])
  );

  const filteredResults = lookupItems
    .filter(
      (contact) =>
        contact.id &&
        !contactIds.includes(contact.id) &&
        !hiddenContactIds?.includes(contact.id)
    )
    .map(toChip);

  const handleChipSelect = (chip: AvatarChipsInputResult): void => {
    const contact = lookupItems.find(
      (lookupContact) => lookupContact.id === chip.optionId
    );
    setSearchTerm("");

    if (!contact?.id) return;

    setContacts(updateContactRecord(contacts, [contact]));
    setFieldValue(name, [...contactIds, contact.id], true);
    onContactsChange?.([
      ...contactIds.map((contactId) => contacts[contactId]),
      contact
    ]);

    if (
      fillsRelatedTo &&
      !hasFilledRelatedTo &&
      !values.companyId &&
      contact.companyId
    ) {
      setFieldValue("companyId", contact.companyId);
      setHasFilledRelatedTo(true);
    }
  };

  const handleChipRemove = (chip: AvatarChipsInputResult): void => {
    const nextContactIds = contactIds.filter(
      (selectedId) => selectedId !== chip.optionId
    );

    setFieldValue(name, nextContactIds, true);
    onContactsChange?.(
      nextContactIds.map((selectedId) => contacts[selectedId])
    );
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
          <AvatarChipsInput
            id={id}
            filteredResults={filteredResults}
            selectedChips={selectedChips}
            searchText={searchTerm}
            onChipSelect={handleChipSelect}
            onChipRemove={handleChipRemove}
            onSearchTextChange={setSearchTerm}
            searchPlaceholder={placeholder}
            selectedSearchPlaceholder={placeholder}
            ariaLabelClearButton={translateAria(["clearSearch"])}
            ariaLabelSearch={label}
            ariaLabelSearchResults={label}
            regionAriaLabel={groupAriaLabel}
            noResultsText={translateText(["emptyStates", "noContacts"])}
            tabIndex={-1}
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
