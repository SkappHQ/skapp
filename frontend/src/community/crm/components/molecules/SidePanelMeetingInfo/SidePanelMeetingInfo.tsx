import { AvatarGroup } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import { TIME_FORMAT_12_HOUR } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import { CrmMeetingVenueEnum } from "~community/crm/enums/common";
import {
  CrmMeetingEntity,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

interface Props {
  meeting: CrmMeetingEntity;
  owner?: CrmOwnerEntity;
  onCompanyClick: () => void;
}

const SidePanelMeetingInfo: FC<Props> = ({
  meeting,
  owner,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "meetingSidePanel"
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 border border-secondary-accent rounded-xl p-3">
        <p className="subtitle1">
          {translateText(["meetingSidePanel", "info", "attendees"])}
        </p>
        {meeting.contacts.length > 0 ? (
          <AvatarGroup
            ariaLabel={translateAria(["attendees"])}
            avatars={meeting.contacts.map((contact) => {
              const contactName = getContactDisplayName(contact);
              const [firstName, lastName] = contactName.split(" ");

              return {
                id: String(contact.id),
                firstName,
                lastName,
                title: contactName,
                size: "sm"
              };
            })}
          />
        ) : (
          <span className="body2">
            {translateText(["activitySidePanel", "info", "noLongerAvailable"])}
          </span>
        )}
      </div>

      <SidePanelActivityInfo
        date={DateTime.fromISO(meeting.meetingDate)}
        dateLabel={translateText(["activitySidePanel", "info", "date"])}
        {...(meeting.startAt && {
          startTime: DateTime.fromISO(meeting.startAt)
        })}
        secondaryRow={
          <PropertyRow
            label={translateText(["meetingSidePanel", "info", "endTime"])}
          >
            <span className="body2">
              {meeting.endAt
                ? DateTime.fromISO(meeting.endAt).toFormat(TIME_FORMAT_12_HOUR)
                : translateText(["activitySidePanel", "info", "noValue"])}
            </span>
          </PropertyRow>
        }
        owner={owner}
        companyName={meeting.company?.name}
        onCompanyClick={onCompanyClick}
      />

      {meeting.meetingVenue && (
        <div className="flex flex-col gap-2 border border-secondary-accent rounded-xl p-3">
          <PropertyRow
            label={translateText([
              "scheduleMeeting",
              "modal",
              "labels",
              "venue"
            ])}
          >
            <span className="body2">
              {translateText([
                "scheduleMeeting",
                "modal",
                "venues",
                meeting.meetingVenue
              ])}
            </span>
          </PropertyRow>
          {meeting.meetingVenue === CrmMeetingVenueEnum.IN_PERSON &&
            meeting.location && (
              <PropertyRow
                label={translateText([
                  "scheduleMeeting",
                  "modal",
                  "labels",
                  "location"
                ])}
              >
                <span className="flex flex-col gap-1">
                  <span className="body2">{meeting.location}</span>
                  {meeting.locationAddress && (
                    <span className="body3 text-secondary-text">
                      {meeting.locationAddress}
                    </span>
                  )}
                  {meeting.locationUrl && (
                    <a
                      href={meeting.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="body3 underline"
                    >
                      {translateText([
                        "scheduleMeeting",
                        "modal",
                        "location",
                        "openInMaps"
                      ])}
                    </a>
                  )}
                </span>
              </PropertyRow>
            )}
        </div>
      )}
    </div>
  );
};

export default SidePanelMeetingInfo;
