import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import { toMeetingRow } from "~community/crm/activities/utils/activityFeedUtil";
import {
  useDeleteMeeting,
  useGetMeetingById,
  useGetRelatedMeetings,
  useUpdateMeeting
} from "~community/crm/api/ActivityApi";
import DeleteActivityModal from "~community/crm/components/molecules/DeleteActivityModal/DeleteActivityModal";
import SidePanelRelatedActivities from "~community/crm/components/molecules/SidePanelRelatedActivities/SidePanelRelatedActivities";
import MeetingSidePanel from "~community/crm/components/organisms/MeetingSidePanel/MeetingSidePanel";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  meetingId: number;
  onAdd: () => void;
}

const ActivityMeetingSidePanel: FC<Props> = ({ meetingId, onAdd }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleSaveError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.WARN,
      title: translateText([
        "activities",
        "logActivity",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "saveErrorDescription"
      ]),
      isIcon: true
    });
  };

  const handleDeleteSuccess = (): void => {
    setIsDeleteModalOpen(false);
    handleClose();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "deleteSuccessTitle"
      ])
    });
  };

  const handleDeleteError = (): void => {
    setIsDeleteModalOpen(false);
    setToastMessage({
      open: true,
      toastType: ToastType.WARN,
      title: translateText([
        "activities",
        "logActivity",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "deleteErrorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: updateMeeting } = useUpdateMeeting(handleSaveError);
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting(
    handleDeleteSuccess,
    handleDeleteError
  );

  const handleAdd = (): void => {
    handleClose();
    onAdd();
  };

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
          <SidePanelRelatedActivities
            title={translateText([
              "activities",
              "meetingSidePanel",
              "relatedTitle"
            ])}
            rows={(relatedMeetings ?? []).map(toMeetingRow)}
            emptyTitle={translateText([
              "activities",
              "meetingSidePanel",
              "noRelatedTitle"
            ])}
            emptyDescription={translateText([
              "activities",
              "meetingSidePanel",
              "noRelatedDescription"
            ])}
            addLabel={translateText(["activities", "toolbar", "logMeetingBtn"])}
            onAdd={handleAdd}
            onRowClick={handleRelatedRowClick}
          />
        }
        onTitleSave={(name) => updateMeeting({ id: meetingId, name })}
        onCommentsSave={(comments) =>
          updateMeeting({ id: meetingId, comments })
        }
        onDelete={() => setIsDeleteModalOpen(true)}
        onDetailsSave={(payload) =>
          updateMeeting({ id: meetingId, ...payload })
        }
      />
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onConfirm={() => deleteMeeting(meetingId)}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default ActivityMeetingSidePanel;
