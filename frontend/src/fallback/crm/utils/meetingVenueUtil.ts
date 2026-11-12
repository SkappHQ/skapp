import { ReactNode } from "react";

import {
  ActivityMeetingResponse,
  ActivityRow,
  ActivityRowSubtitlePart
} from "~community/crm/activities/types/activityTypes";
import { CrmMeetingEntity } from "~community/crm/types/CrmCommonTypes";
import { CrmMeetingVenueDetails } from "~enterprise/crm/types/ScheduleMeetingTypes";

interface MeetingVenueSubtitleParams {
  id: string;
  row: ActivityRow;
  className: string;
}

export const getMeetingVenueRowFields = (
  _meeting: ActivityMeetingResponse
): CrmMeetingVenueDetails => ({});

export const getMeetingVenueSubtitleParts = (
  _params: MeetingVenueSubtitleParams
): ActivityRowSubtitlePart[] => [];

export const getMeetingVenueInfo = (_meeting: CrmMeetingEntity): ReactNode =>
  null;
