import { Chip } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useContactLookup } from "~community/crm/hooks/useContactLookup";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";
import { isDealMatchingCompany } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  formik: FormikProps<CrmLogMeetingFormValues>;
  isFromDifferentCompanies: boolean;
  onDealCleared: () => void;
}

const MeetingAttendeesField: FC<Props> = ({
  id,
  formik,
  isFromDifferentCompanies,
  onDealCleared
}) => {
  const { values, errors, touched, setFieldValue } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logMeeting",
    "modal"
  );
  const translateActivityText = useTranslator(
    "crmModule",
    "activities",
    "logActivity"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logMeeting",
    "modal"
  );

  const { contacts, deals, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [hasFilledRelatedTo, setHasFilledRelatedTo] = useState(false);

  const { isSearchActive, lookupItems, dropdownItems } =
    useContactLookup(searchTerm);

  const attendees = values.contactIds.map((contactId) => contacts[contactId]);

  const clearMismatchedDeal = (nextAttendees: CrmContactEntity[]): void => {
    const selectedDeal = values.dealId ? deals[values.dealId] : null;

    if (!selectedDeal || nextAttendees.length === 0) return;

    const isDealMatched = nextAttendees.some((attendee) =>
      isDealMatchingCompany(selectedDeal, attendee.companyId)
    );

    if (isDealMatched) return;

    setFieldValue("dealId", null);
    onDealCleared();
  };

  const handleSelect = (item: SearchableDropdownItem): void => {
    const contact = lookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    setSearchTerm("");

    if (!contact?.id || values.contactIds.includes(contact.id)) return;

    setContacts(updateContactRecord(contacts, [contact]));
    setFieldValue("contactIds", [...values.contactIds, contact.id], true);
    clearMismatchedDeal([...attendees, contact]);

    if (!hasFilledRelatedTo && !values.companyId && contact.companyId) {
      setFieldValue("companyId", contact.companyId);
      setHasFilledRelatedTo(true);
    }
  };

  const handleRemove = (contactId: number): void => {
    const nextContactIds = values.contactIds.filter(
      (attendeeId) => attendeeId !== contactId
    );

    setFieldValue("contactIds", nextContactIds, true);
    clearMismatchedDeal(
      nextContactIds.map((attendeeId) => contacts[attendeeId])
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <SearchableDropdown
        positionStrategy="fixed"
        id={id}
        items={dropdownItems}
        onSelect={handleSelect}
        label={translateText(["labels", "attendees"])}
        placeholder={translateText(["placeholders", "attendees"])}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        isOpenOnFocus={isSearchActive}
        emptyMessage={translateActivityText(["emptyStates", "noContacts"])}
        state={touched.contactIds && errors.contactIds ? "error" : "default"}
        {...(touched.contactIds &&
          errors.contactIds && { errorMessage: String(errors.contactIds) })}
        required
      />

      {values.contactIds.length > 0 && (
        <div
          role="group"
          aria-label={translateAria(["attendees"])}
          className="flex flex-wrap gap-2"
        >
          {values.contactIds.map((contactId) => {
            const contactName = getContactDisplayName(contacts[contactId]);

            return (
              <Chip
                key={contactId}
                size="sm"
                label={contactName}
                onDelete={() => handleRemove(contactId)}
                ariaLabel={{
                  removeButton: translateAria(["removeAttendee"], {
                    name: contactName
                  })
                }}
              />
            );
          })}
        </div>
      )}

      {isFromDifferentCompanies && (
        <span role="status" className="text-sm text-semantic-amber-text">
          {translateText(["notices", "differentCompanies"])}
        </span>
      )}
    </div>
  );
};

export default MeetingAttendeesField;
