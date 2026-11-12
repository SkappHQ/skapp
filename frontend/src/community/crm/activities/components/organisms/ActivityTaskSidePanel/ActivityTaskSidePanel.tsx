import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";
import { toTaskRow } from "~community/crm/activities/utils/activityFeedUtil";
import {
  useDeleteActivityTask,
  useGetActivityTaskById,
  useGetRelatedActivityTasks,
  useUpdateActivityTask
} from "~community/crm/api/ActivityApi";
import DeleteActivityModal from "~community/crm/components/molecules/DeleteActivityModal/DeleteActivityModal";
import SidePanelRelatedActivities from "~community/crm/components/molecules/SidePanelRelatedActivities/SidePanelRelatedActivities";
import TaskActivitySidePanel from "~community/crm/components/organisms/TaskActivitySidePanel/TaskActivitySidePanel";
import { useActivitySidePanelActions } from "~community/crm/hooks/useActivitySidePanelActions";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  taskId: number;
  onCompletionChange: (taskId: number) => void;
}

const ActivityTaskSidePanel: FC<Props> = ({ taskId, onCompletionChange }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    setSelectedActivityTaskId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      isCrmSidePanelOpen: state.isCrmSidePanelOpen,
      crmSidePanelType: state.crmSidePanelType,
      setSelectedActivityTaskId: state.setSelectedActivityTaskId,
      closeCrmSidePanel: state.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.ACTIVITY_TASK_SIDE_PANEL;

  const {
    data: task,
    isError,
    isFetching
  } = useGetActivityTaskById(taskId, isOpen);
  const { data: relatedTasks } = useGetRelatedActivityTasks(taskId, isOpen);

  const handleClose = (): void => {
    setSelectedActivityTaskId(null);
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

  const { mutate: updateTask } = useUpdateActivityTask(handleSaveError);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteActivityTask(
    handleDeleteSuccess,
    handleDeleteError
  );

  const openRecord = (url: string): void => {
    handleClose();
    router.push(url);
  };

  const handleContactClick = (): void => {
    if (task?.contact?.id) {
      openRecord(ROUTES.CRM.CONTACT_DETAIL(task.contact.id));
    }
  };

  const handleCompanyClick = (): void => {
    if (task?.company?.id) {
      openRecord(ROUTES.CRM.COMPANY_DETAIL(task.company.id));
    }
  };

  const handleCompletionChange = (isCompleted: boolean): void => {
    onCompletionChange(taskId);
    updateTask({ id: taskId, isCompleted });
  };

  const handleRelatedRowClick = (row: ActivityRow): void => {
    setSelectedActivityTaskId(row.id);
  };

  return (
    <>
      <TaskActivitySidePanel
        {...(task && { task })}
        isOpen={isOpen}
        onClose={handleClose}
        related={
          relatedTasks &&
          relatedTasks.length > 0 && (
            <SidePanelRelatedActivities
              title={translateText([
                "activities",
                "taskSidePanel",
                "relatedTitle"
              ])}
              rows={relatedTasks.map(toTaskRow)}
              onRowClick={handleRelatedRowClick}
            />
          )
        }
        onTitleSave={(name) => updateTask({ id: taskId, name })}
        onCommentsSave={(notes) => updateTask({ id: taskId, notes })}
        onDelete={openDeleteModal}
        onMarkAsDone={() => handleCompletionChange(true)}
        onReopen={() => handleCompletionChange(false)}
        onContactClick={handleContactClick}
        onCompanyClick={handleCompanyClick}
      />
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onConfirm={() => deleteTask(taskId)}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default ActivityTaskSidePanel;
