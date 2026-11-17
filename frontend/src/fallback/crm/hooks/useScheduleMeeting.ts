import { ButtonV2Props } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { CrmActivityPrefill } from "~community/crm/types/CrmCommonTypes";

const useScheduleMeeting = (
  _prefill?: CrmActivityPrefill
): {
  scheduleMeetingButton: ButtonV2Props | null;
  scheduleMeetingModals: ReactNode;
} => ({
  scheduleMeetingButton: null,
  scheduleMeetingModals: null
});

export default useScheduleMeeting;
