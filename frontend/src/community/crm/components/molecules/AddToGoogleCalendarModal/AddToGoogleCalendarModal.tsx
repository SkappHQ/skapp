import { ArrowLeftIcon, CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC } from "react";

import GoogleCalendarIcon from "~community/common/assets/Icons/GoogleCalendarIcon";
import {
  SHORT_WEEKDAY_DATE_FORMAT,
  TIME_FORMAT_12_HOUR
} from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityTypeIcon from "~community/crm/activities/components/atoms/ActivityTypeIcon/ActivityTypeIcon";
import {
  ActivityMeetingOverlapResponse,
  ActivityMeetingSchedulePayload,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import CalendarEventCard from "~community/crm/components/molecules/CalendarEventCard/CalendarEventCard";

interface Props {
  meeting: ActivityMeetingSchedulePayload;
  overlaps: ActivityMeetingOverlapResponse[];
  isPending: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

const AddToGoogleCalendarModal: FC<Props> = ({
  meeting,
  overlaps,
  isPending,
  onBack,
  onConfirm,
  onClose
}) => {
  const translateText = useTranslator("crmModule", "activities");

  const hasOverlaps = overlaps.length > 0;

  const formatTimeRange = (startAt: string, endAt: string): string =>
    `${DateTime.fromISO(startAt).toFormat(TIME_FORMAT_12_HOUR)} – ${DateTime.fromISO(endAt).toFormat(TIME_FORMAT_12_HOUR)}`;

  const meetingDetails = [
    meeting.startAt &&
      meeting.endAt &&
      `${DateTime.fromISO(meeting.startAt).toFormat(SHORT_WEEKDAY_DATE_FORMAT)} • ${formatTimeRange(meeting.startAt, meeting.endAt)}`,
    `${translateText(
      ["scheduleMeeting", "addToCalendarModal", "attendeeCount"],
      {
        count: meeting.contactIds.length
      }
    )} • ${translateText(["scheduleMeeting", "modal", "venues", meeting.meetingVenue])}`
  ].filter((detail): detail is string => Boolean(detail));

  return (
    <SmallModal
      isOpen
      onClose={onClose}
      modalHeader={translateText([
        "scheduleMeeting",
        "addToCalendarModal",
        "title"
      ])}
      content={
        <div className="flex flex-col gap-6">
          <p className="text-base text-primary-text">
            {hasOverlaps
              ? translateText([
                  "scheduleMeeting",
                  "addToCalendarModal",
                  "overlapDescription"
                ])
              : translateText([
                  "scheduleMeeting",
                  "addToCalendarModal",
                  "description"
                ])}
          </p>
          {hasOverlaps &&
            overlaps.map((overlap) => (
              <CalendarEventCard
                key={`${overlap.name}-${overlap.startAt}`}
                icon={
                  <ActivityTypeIcon
                    id={`overlap-${overlap.startAt}`}
                    type={ActivityType.MEETING}
                  />
                }
                title={overlap.name}
                details={[
                  overlap.organizerName
                    ? `${formatTimeRange(overlap.startAt, overlap.endAt)} • ${overlap.organizerName}`
                    : formatTimeRange(overlap.startAt, overlap.endAt)
                ]}
              />
            ))}
          {!hasOverlaps && (
            <CalendarEventCard
              icon={<GoogleCalendarIcon />}
              title={meeting.name}
              details={meetingDetails}
            />
          )}
        </div>
      }
      buttons={{
        buttonLeft: hasOverlaps
          ? {
              variant: "tertiary",
              children: translateText([
                "scheduleMeeting",
                "addToCalendarModal",
                "backBtn"
              ]),
              icon: <ArrowLeftIcon />,
              iconPosition: "start",
              disabled: isPending,
              onClick: onBack
            }
          : {
              variant: "tertiary",
              children: translateText(["logActivity", "buttons", "cancel"]),
              icon: <CloseIcon />,
              iconPosition: "end",
              disabled: isPending,
              onClick: onBack
            },
        buttonRight: {
          variant: "primary",
          children: hasOverlaps
            ? translateText([
                "scheduleMeeting",
                "addToCalendarModal",
                "confirmBtn"
              ])
            : translateText([
                "scheduleMeeting",
                "addToCalendarModal",
                "addBtn"
              ]),
          disabled: isPending,
          isLoading: isPending,
          onClick: onConfirm
        }
      }}
    />
  );
};

export default AddToGoogleCalendarModal;
