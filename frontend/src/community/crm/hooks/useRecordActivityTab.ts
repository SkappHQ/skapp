import { useState } from "react";

import { DEFAULT_ACTIVITY_TAB } from "~community/crm/activities/constants/activityConstants";
import { ActivityTab } from "~community/crm/activities/types/activityTypes";

export const useRecordActivityTab = (
  recordId: number
): [ActivityTab, (tab: ActivityTab) => void] => {
  const [selection, setSelection] = useState({
    recordId,
    tab: DEFAULT_ACTIVITY_TAB
  });

  const activityTab =
    selection.recordId === recordId ? selection.tab : DEFAULT_ACTIVITY_TAB;

  const setActivityTab = (tab: ActivityTab): void =>
    setSelection({ recordId, tab });

  return [activityTab, setActivityTab];
};
