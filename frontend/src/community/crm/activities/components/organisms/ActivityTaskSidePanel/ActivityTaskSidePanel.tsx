import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
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
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

interface Props {
  taskId: number;
  onAdd: () => void;
}

const ActivityTaskSidePanel: FC<Props> = ({ taskId, onAdd }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      toastType: ToastType.ERROR,
      title: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "saveErrorTitle"
      ]),
      description: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "errorDescription"
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
      toastType: ToastType.ERROR,
      title: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "deleteErrorTitle"
      ]),
      description: translateText([
        "activities",
        "activitySidePanel",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

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

  const handleAdd = (): void => {
    handleClose();
    onAdd();
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
          <SidePanelRelatedActivities
            title={translateText([
              "activities",
              "taskSidePanel",
              "relatedTitle"
            ])}
            rows={(relatedTasks ?? []).map(toTaskRow)}
            emptyTitle={translateText([
              "activities",
              "taskSidePanel",
              "noRelatedTitle"
            ])}
            emptyDescription={translateText([
              "activities",
              "taskSidePanel",
              "noRelatedDescription"
            ])}
            addLabel={translateText(["activities", "toolbar", "addTaskBtn"])}
            onAdd={handleAdd}
            onRowClick={handleRelatedRowClick}
          />
        }
        onTitleSave={(name) => updateTask({ id: taskId, name })}
        onCommentsSave={(notes) => updateTask({ id: taskId, notes })}
        onDelete={() => setIsDeleteModalOpen(true)}
        onMarkAsDone={() => updateTask({ id: taskId, isCompleted: true })}
        onReopen={() => updateTask({ id: taskId, isCompleted: false })}
        onContactClick={handleContactClick}
        onCompanyClick={handleCompanyClick}
      />
      <DeleteActivityModal
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onConfirm={() => deleteTask(taskId)}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default ActivityTaskSidePanel;
