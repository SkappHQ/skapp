import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteTask } from "~community/crm/v2/api/TaskApi";
import CrmDeleteModalContent from "~community/crm/v2/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  removeTaskFromRecord,
  removeTaskId
} from "~community/crm/v2/utils/taskUtil";

const DeleteTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "deleteTaskModal");

  const {
    selectedTaskId,
    setSelectedTaskId,
    setIsTaskModalOpen,
    closeCrmSidePanel,
    tasks,
    taskIds,
    setTasks,
    setTaskIds
  } = useCrmStoreV2(
    useShallow((store) => ({
      selectedTaskId: store.selectedTaskId,
      setSelectedTaskId: store.setSelectedTaskId,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      closeCrmSidePanel: store.closeCrmSidePanel,
      tasks: store.tasks,
      taskIds: store.taskIds,
      setTasks: store.setTasks,
      setTaskIds: store.setTaskIds
    }))
  );

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = () => {
    if (selectedTaskId !== null) {
      setTasks(removeTaskFromRecord(tasks, selectedTaskId));
      setTaskIds(removeTaskId(taskIds, selectedTaskId));
    }

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });

    handleCloseModal();
    closeCrmSidePanel();
    setSelectedTaskId(null);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: deleteTask, isPending } = useDeleteTask(
    handleSuccess,
    handleError
  );

  const handleDeleteTask = () => {
    if (selectedTaskId === null) return;

    deleteTask(selectedTaskId);
  };

  return (
    <CrmDeleteModalContent
      description={translateText(["description"])}
      isPending={isPending}
      confirmLabel={translateText(["buttons", "confirm"])}
      cancelLabel={translateText(["buttons", "cancel"])}
      confirmAriaLabel={translateText(["ariaLabels", "confirm"])}
      cancelAriaLabel={translateText(["ariaLabels", "cancel"])}
      onConfirm={handleDeleteTask}
      onClose={handleCloseModal}
    />
  );
};

export default DeleteTaskModalContent;
