import { DateTime } from "luxon";
import { FC } from "react";

import { TIME_FORMAT_12_HOUR } from "~community/common/constants/timeConstants";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { instantInZone } from "~community/common/utils/dateTimeUtils";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import {
  CrmMeetingEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface Props {
  meeting: CrmMeetingEntity;
  owner?: CrmOwnerEntity;
  onContactClick: (contactId: number) => void;
  onCompanyClick: () => void;
}

const SidePanelMeetingInfo: FC<Props> = ({
  meeting,
  owner,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "meetingSidePanel",
    "info"
  );
  const translateActivityText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel",
    "info"
  );
  const displayZone = useDisplayZone();

  return (
    <SidePanelActivityInfo
      primaryRow={
        <PropertyRow label={translateText(["attendees"])}>
          {meeting.contacts.length > 0 ? (
            <div className="flex flex-col items-start gap-1 min-w-0">
              {meeting.contacts.map((contact) => {
                const contactId = contact.id;

                return (
                  contactId && (
                    <SidePanelLinkButton
                      key={contactId}
                      label={getContactDisplayName(contact)}
                      onClick={() => onContactClick(contactId)}
                    />
                  )
                );
              })}
            </div>
          ) : (
            <span className="body2">
              {translateActivityText(["noLongerAvailable"])}
            </span>
          )}
        </PropertyRow>
      }
      date={DateTime.fromISO(meeting.meetingDate)}
      {...(meeting.startAt && {
        startTime: instantInZone(meeting.startAt, displayZone)
      })}
      secondaryRow={
        <PropertyRow label={translateText(["endTime"])}>
          <span className="body2">
            {meeting.endAt
              ? instantInZone(meeting.endAt, displayZone).toFormat(
                  TIME_FORMAT_12_HOUR
                )
              : translateActivityText(["noValue"])}
          </span>
        </PropertyRow>
      }
      owner={owner}
      companyName={meeting.company?.name}
      onCompanyClick={onCompanyClick}
    />
  );
};

export default SidePanelMeetingInfo;
