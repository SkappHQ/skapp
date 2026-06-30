import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteTask } from "~community/crm/api/TaskApi";
import { useCrmStore } from "~community/crm/store/store";

const DeleteTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const {
    selectedTaskId,
    setSelectedTaskId,
    setIsTaskModalOpen,
    setIsCrmSidePanelOpen
  } = useCrmStore((store) => ({
    selectedTaskId: store.selectedTaskId,
    setSelectedTaskId: store.setSelectedTaskId,
    setIsTaskModalOpen: store.setIsTaskModalOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));

  const translateText = useTranslator("crmModule", "tasks", "deleteTaskModal");

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });

    handleCloseModal();
    setIsCrmSidePanelOpen(false);
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
    if (selectedTaskId === null || selectedTaskId === undefined) return;
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
