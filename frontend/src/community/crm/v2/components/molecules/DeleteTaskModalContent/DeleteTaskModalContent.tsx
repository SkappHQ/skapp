import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteTask } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  removeEntityFromRecord,
  removeId
} from "~community/crm/v2/utils/crmEntityUtils";

const DeleteTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const {
    selectedTaskId,
    setSelectedTaskId,
    setIsTaskModalOpen,
    closeCrmSidePanel
  } = useCrmStoreV2((state) => ({
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    closeCrmSidePanel: state.closeCrmSidePanel
  }));

  const translateText = useTranslator("crmModule", "tasks", "deleteTaskModal");

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
  };

  /**
   * The store is otherwise only ever merged into, so the deleted task has to be
   * taken out of both the record and the displayed order by hand - dropping the
   * id alone would leave the entity behind, and dropping the entity alone would
   * leave the row pointing at nothing.
   */
  const removeDeletedTaskFromStore = (deletedTaskId: number) => {
    const { tasks, taskIds, setTasks, setTaskIds } = useCrmStoreV2.getState();

    setTasks(removeEntityFromRecord(tasks, deletedTaskId));
    setTaskIds(removeId(taskIds, deletedTaskId));
  };

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });

    if (selectedTaskId !== null) {
      removeDeletedTaskFromStore(selectedTaskId);
    }

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
    <div className="flex flex-col">
      <div>{translateText(["description"])}</div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="error"
          type="button"
          icon={
            <DeleteButtonIcon
              height="12px"
              width="9.33px"
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
          onClick={handleDeleteTask}
          disabled={isPending}
          aria-label={translateText(["ariaLabels", "confirm"])}
        >
          {translateText(["buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteTaskModalContent;
