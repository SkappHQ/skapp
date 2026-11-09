import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityWarningTooltip from "~community/crm/components/atoms/ActivityWarningTooltip/ActivityWarningTooltip";
import MeetingAttendeeChips from "~community/crm/components/molecules/MeetingAttendeeChips/MeetingAttendeeChips";
import { useContactLookup } from "~community/crm/hooks/useContactLookup";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmLogMeetingFormValues,
  CrmScheduleMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import { updateContactRecord } from "~community/crm/utils/contactUtil";
import { isDealMatchingContacts } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  formik:
    | FormikProps<CrmLogMeetingFormValues>
    | FormikProps<CrmScheduleMeetingFormValues>;
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

  const translateText = useTranslator("crmModule", "activities");

  const { contacts, deals, setContacts } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals,
      setContacts: store.setContacts
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");

  const { isSearchActive, isLoading, lookupItems, dropdownItems } =
    useContactLookup(searchTerm);

  const handleSelect = (item: SearchableDropdownItem): void => {
    const contact = lookupItems.find(
      (lookupContact) => String(lookupContact.id) === item.id
    );
    setSearchTerm("");

    if (!contact?.id || values.contactIds.includes(contact.id)) return;

    setContacts(updateContactRecord(contacts, [contact]));
    setFieldValue("contactIds", [...values.contactIds, contact.id], true);
  };

  const handleRemove = (contactId: number): void => {
    const nextContactIds = values.contactIds.filter(
      (attendeeId) => attendeeId !== contactId
    );
    setFieldValue("contactIds", nextContactIds, true);

    const selectedDeal = values.dealId ? deals[values.dealId] : null;
    const nextAttendees = nextContactIds.map(
      (attendeeId) => contacts[attendeeId]
    );

    const isDealUnmatched =
      selectedDeal &&
      nextAttendees.length > 0 &&
      isDealMatchingContacts(
        selectedDeal,
        values.contactIds.map((attendeeId) => contacts[attendeeId])
      ) &&
      !isDealMatchingContacts(selectedDeal, nextAttendees);

    if (isDealUnmatched) {
      setFieldValue("dealId", null);
      onDealCleared();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <SearchableDropdown
        positionStrategy="fixed"
        id={id}
        items={dropdownItems}
        onSelect={handleSelect}
        label={translateText(["logMeeting", "modal", "labels", "attendees"])}
        placeholder={translateText([
          "logMeeting",
          "modal",
          "placeholders",
          "attendees"
        ])}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        isOpenOnFocus={isSearchActive}
        emptyMessage={translateText([
          "logActivity",
          "emptyStates",
          "noContacts"
        ])}
        {...(isLoading && {
          loadingMessage: translateText([
            "logActivity",
            "emptyStates",
            "searching"
          ])
        })}
        state={touched.contactIds && errors.contactIds ? "error" : "default"}
        {...(touched.contactIds &&
          errors.contactIds && { errorMessage: String(errors.contactIds) })}
        required
      />

      {values.contactIds.length > 0 && (
        <MeetingAttendeeChips
          contactIds={values.contactIds}
          onRemove={handleRemove}
        />
      )}

      {isFromDifferentCompanies && (
        <ActivityWarningTooltip
          id={`${id}-companies`}
          text={translateText([
            "logMeeting",
            "modal",
            "tooltips",
            "differentCompanies"
          ])}
        />
      )}
    </div>
  );
};

export default MeetingAttendeesField;
