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

interface Props {
  taskId: number;
}

const DeleteTaskModalContent: FC<Props> = ({ taskId }) => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "deleteTaskModal");

  const {
    tasks,
    taskIds,
    setTasks,
    setTaskIds,
    setSelectedTaskId,
    closeCrmSidePanel,
    setIsTaskModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      taskIds: store.taskIds,
      setTasks: store.setTasks,
      setTaskIds: store.setTaskIds,
      setSelectedTaskId: store.setSelectedTaskId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = () => {
    setTasks(removeTaskFromRecord(tasks, taskId));
    setTaskIds(removeTaskId(taskIds, taskId));

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
    deleteTask(taskId);
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
