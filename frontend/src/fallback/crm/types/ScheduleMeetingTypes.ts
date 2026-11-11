import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";

enum CrmMeetingVenueEnum {}

export interface CrmMeetingVenueDetails {
  meetingVenue?: CrmMeetingVenueEnum | null;
  location?: string | null;
  locationAddress?: string | null;
  locationUrl?: string | null;
}

export type CrmScheduleMeetingFormValues = CrmLogMeetingFormValues;
