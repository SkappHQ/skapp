import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddTaskModalContent from "~community/crm/components/molecules/AddTaskModalContent/AddTaskModalContent";
import DeleteTaskModalContent from "~community/crm/components/molecules/DeleteTaskModalContent/DeleteTaskModalContent";
import EditTaskModalContent from "~community/crm/components/molecules/EditTaskModalContent/EditTaskModalContent";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const TaskModalController = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const {
    isTaskModalOpen,
    taskModalType,
    setIsTaskModalOpen,
    setSelectedTaskId
  } = useCrmStore(
    useShallow((store) => ({
      isTaskModalOpen: store.isTaskModalOpen,
      taskModalType: store.taskModalType,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setSelectedTaskId: store.setSelectedTaskId
    }))
  );

  const handleCloseModal = (): void => {
    setSelectedTaskId(null);
    setIsTaskModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes): string => {
    switch (modalType) {
      case CrmModalTypes.ADD_TASK_MODAL:
        return translateText(["addTaskModal", "title"]);
      case CrmModalTypes.DELETE_TASK_MODAL:
        return translateText(["deleteTaskModal", "title"]);
      case CrmModalTypes.EDIT_TASK_MODAL:
        return translateText(["editTaskModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (taskModalType) {
      case CrmModalTypes.ADD_TASK_MODAL:
        return <AddTaskModalContent />;
      case CrmModalTypes.DELETE_TASK_MODAL:
        return <DeleteTaskModalContent />;
      case CrmModalTypes.EDIT_TASK_MODAL:
        return <EditTaskModalContent />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isTaskModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(taskModalType)}
      content={getModalContent()}
    />
  );
};

export default TaskModalController;
