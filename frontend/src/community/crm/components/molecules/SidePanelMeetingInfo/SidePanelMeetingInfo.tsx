import { AvatarGroup } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import { TIME_FORMAT_12_HOUR } from "~community/common/constants/timeConstants";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { instantInZone } from "~community/common/utils/dateTimeUtils";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
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
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "meetingSidePanel"
  );
  const displayZone = useDisplayZone();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 border border-secondary-accent rounded-xl p-3">
        <p className="subtitle1">{translateText(["attendees"])}</p>
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
            {translateActivityText(["noLongerAvailable"])}
          </span>
        )}
      </div>

      <SidePanelActivityInfo
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
    </div>
  );
};

export default SidePanelMeetingInfo;
