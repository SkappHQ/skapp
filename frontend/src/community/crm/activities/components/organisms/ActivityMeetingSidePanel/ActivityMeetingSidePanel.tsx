import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import { toMeetingRow } from "~community/crm/activities/utils/activityFeedUtil";
import { toDealEditPayload } from "~community/crm/activities/utils/activityUtil";
import {
  useDeleteMeeting,
  useGetMeetingById,
  useGetRelatedMeetings,
  useUpdateMeeting
} from "~community/crm/api/ActivityApi";
import DeleteActivityModal from "~community/crm/components/molecules/DeleteActivityModal/DeleteActivityModal";
import SidePanelRelatedActivities from "~community/crm/components/molecules/SidePanelRelatedActivities/SidePanelRelatedActivities";
import MeetingSidePanel from "~community/crm/components/organisms/MeetingSidePanel/MeetingSidePanel";
import { useActivitySidePanelActions } from "~community/crm/hooks/useActivitySidePanelActions";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  meetingId: number;
}

const ActivityMeetingSidePanel: FC<Props> = ({ meetingId }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedMeetingId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setSelectedMeetingId: state.setSelectedMeetingId,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.MEETING_SIDE_PANEL;

  const {
    data: meeting,
    isError,
    isFetching
  } = useGetMeetingById(meetingId, isOpen);
  const { data: relatedMeetings } = useGetRelatedMeetings(meetingId, isOpen);

  const handleClose = (): void => {
    setSelectedMeetingId(null);
    closeCrmSidePanel();
  };

  const {
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    handleSaveError,
    handleDeleteSuccess,
    handleDeleteError
  } = useActivitySidePanelActions(handleClose);

  useEffect(() => {
    if (!isError || isFetching) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["common", "initData", "errorTitle"]),
      description: translateText(["common", "initData", "errorDescription"]),
      isIcon: true
    });
    handleClose();
  }, [isError, isFetching]);

  const { mutate: updateMeeting } = useUpdateMeeting(handleSaveError);
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting(
    handleDeleteSuccess,
    handleDeleteError
  );

  const handleRelatedRowClick = (row: ActivityRow): void => {
    setSelectedMeetingId(row.id);
  };

  return (
    <>
      <MeetingSidePanel
        {...(meeting && { meeting })}
        isOpen={isOpen}
        onClose={handleClose}
        related={
          relatedMeetings &&
          relatedMeetings.length > 0 && (
            <SidePanelRelatedActivities
              title={translateText([
                "activities",
                "meetingSidePanel",
                "relatedTitle"
              ])}
              rows={(relatedMeetings ?? []).map(toMeetingRow)}
              onRowClick={handleRelatedRowClick}
            />
          )
        }
        onTitleSave={(name) => updateMeeting({ id: meetingId, name })}
        onCommentsSave={(comments) =>
          updateMeeting({ id: meetingId, comments })
        }
        onDelete={openDeleteModal}
        onDealChange={(dealId) =>
          updateMeeting(toDealEditPayload(meetingId, dealId))
        }
        onDetailsSave={updateMeeting}
      />
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onConfirm={() => deleteMeeting(meetingId)}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default ActivityMeetingSidePanel;
