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
import { updateContactRecord } from "~community/crm/utils/contactUtil";
import { isDealMatchingContacts } from "~community/crm/utils/dealUtil";

interface Props {
  id: string;
  contactIds: number[];
  dealId: number | null;
  errorMessage?: string;
  onChange: (contactIds: number[]) => void;
  isFromDifferentCompanies: boolean;
  onDealCleared: () => void;
}

const MeetingAttendeesField: FC<Props> = ({
  id,
  contactIds,
  dealId,
  errorMessage,
  onChange,
  isFromDifferentCompanies,
  onDealCleared
}) => {
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

    if (!contact?.id || contactIds.includes(contact.id)) return;

    setContacts(updateContactRecord(contacts, [contact]));
    onChange([...contactIds, contact.id]);
  };

  const handleRemove = (contactId: number): void => {
    const nextContactIds = contactIds.filter(
      (attendeeId) => attendeeId !== contactId
    );
    onChange(nextContactIds);

    const selectedDeal = dealId ? deals[dealId] : null;
    const nextAttendees = nextContactIds.map(
      (attendeeId) => contacts[attendeeId]
    );

    const isDealUnmatched =
      selectedDeal &&
      nextAttendees.length > 0 &&
      isDealMatchingContacts(
        selectedDeal,
        contactIds.map((attendeeId) => contacts[attendeeId])
      ) &&
      !isDealMatchingContacts(selectedDeal, nextAttendees);

    if (isDealUnmatched) {
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
        state={errorMessage ? "error" : "default"}
        {...(errorMessage && { errorMessage })}
        required
      />

      {contactIds.length > 0 && (
        <MeetingAttendeeChips contactIds={contactIds} onRemove={handleRemove} />
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
