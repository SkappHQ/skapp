import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";

enum CrmMeetingVenueEnum {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON"
}

export interface CrmMeetingVenueDetails {
  meetingVenue?: CrmMeetingVenueEnum | null;
  location?: string | null;
  locationAddress?: string | null;
  locationUrl?: string | null;
}

export interface CrmScheduleMeetingFormValues extends CrmLogMeetingFormValues {
  meetingVenue: CrmMeetingVenueEnum;
  location: string;
  locationAddress: string;
  locationUrl: string;
}
