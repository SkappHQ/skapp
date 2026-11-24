import { useShallow } from "zustand/react/shallow";

import {
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

export const useOpenActivitySidePanel = (): ((row: ActivityRow) => void) => {
  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedCallId,
    setSelectedMeetingId,
    setSelectedActivityTaskId,
    setSelectedEmailId,
    setCrmSidePanelReturnType,
    openCrmSidePanel
  } = useCrmStore(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      setSelectedCallId: store.setSelectedCallId,
      setSelectedMeetingId: store.setSelectedMeetingId,
      setSelectedActivityTaskId: store.setSelectedActivityTaskId,
      setSelectedEmailId: store.setSelectedEmailId,
      setCrmSidePanelReturnType: store.setCrmSidePanelReturnType,
      openCrmSidePanel: store.openCrmSidePanel
    }))
  );

  return (row: ActivityRow): void => {
    setCrmSidePanelReturnType(isCrmSidePanelOpen ? crmSidePanelType : null);

    switch (row.type) {
      case ActivityType.CALL:
        setSelectedCallId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.CALL_SIDE_PANEL);
        break;
      case ActivityType.MEETING:
        setSelectedMeetingId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.MEETING_SIDE_PANEL);
        break;
      case ActivityType.TASK:
        setSelectedActivityTaskId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.ACTIVITY_TASK_SIDE_PANEL);
        break;
      case ActivityType.EMAIL:
        setSelectedEmailId(row.id);
        openCrmSidePanel(CrmSidePanelTypes.EMAIL_SIDE_PANEL);
        break;
      default:
        break;
    }
  };
};
