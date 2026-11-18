import {
  CrmActivityPrefill,
  UseScheduleMeetingResult
} from "~community/crm/types/CrmCommonTypes";

const useScheduleMeeting = (
  _prefill?: CrmActivityPrefill
): UseScheduleMeetingResult => ({
  scheduleMeetingButton: null,
  scheduleMeetingModals: null
});

export default useScheduleMeeting;
