import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import ActivityCallSidePanel from "~community/crm/activities/components/organisms/ActivityCallSidePanel/ActivityCallSidePanel";
import ActivityEmailSidePanel from "~community/crm/activities/components/organisms/ActivityEmailSidePanel/ActivityEmailSidePanel";
import ActivityMeetingSidePanel from "~community/crm/activities/components/organisms/ActivityMeetingSidePanel/ActivityMeetingSidePanel";
import ActivityTaskSidePanel from "~community/crm/activities/components/organisms/ActivityTaskSidePanel/ActivityTaskSidePanel";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useCrmStore } from "~community/crm/store/store";

const ActivitySidePanels: FC = () => {
  const {
    selectedCallId,
    selectedMeetingId,
    selectedActivityTaskId,
    selectedEmailId,
    isCrmSidePanelOpen
  } = useCrmStore(
    useShallow((store) => ({
      selectedCallId: store.selectedCallId,
      selectedMeetingId: store.selectedMeetingId,
      selectedActivityTaskId: store.selectedActivityTaskId,
      selectedEmailId: store.selectedEmailId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen
    }))
  );

  return (
    <>
      {selectedCallId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityCallSidePanel callId={selectedCallId} />
        </SidePanelWrapper>
      )}
      {selectedMeetingId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityMeetingSidePanel meetingId={selectedMeetingId} />
        </SidePanelWrapper>
      )}
      {selectedActivityTaskId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityTaskSidePanel taskId={selectedActivityTaskId} />
        </SidePanelWrapper>
      )}
      {selectedEmailId !== null && (
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          <ActivityEmailSidePanel emailId={selectedEmailId} />
        </SidePanelWrapper>
      )}
    </>
  );
};

export default ActivitySidePanels;
