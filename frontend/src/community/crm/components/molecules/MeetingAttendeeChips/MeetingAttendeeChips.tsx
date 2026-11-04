import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface Props {
  contactIds: number[];
  onRemove: (contactId: number) => void;
}

const MeetingAttendeeChips: FC<Props> = ({ contactIds, onRemove }) => {
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logMeeting",
    "modal"
  );

  const contacts = useCrmStore((store) => store.contacts);

  return (
    <fieldset
      aria-label={translateAria(["attendees"])}
      className="flex min-w-0 flex-wrap gap-2"
    >
      {contactIds.map((contactId) => {
        const contactName = getContactDisplayName(contacts[contactId]);

        return (
          <Chip
            key={contactId}
            size="sm"
            label={contactName}
            onDelete={() => onRemove(contactId)}
            ariaLabel={{
              removeButton: translateAria(["removeAttendee"], {
                name: contactName
              })
            }}
          />
        );
      })}
    </fieldset>
  );
};

export default MeetingAttendeeChips;
