import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddTaskModalContent from "~community/crm/v2/components/molecules/AddTaskModalContent/AddTaskModalContent";
import DeleteTaskModalContent from "~community/crm/v2/components/molecules/DeleteTaskModalContent/DeleteTaskModalContent";
import EditTaskModalContent from "~community/crm/v2/components/molecules/EditTaskModalContent/EditTaskModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";

const TaskModalController = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const {
    isTaskModalOpen,
    taskModalType,
    setIsTaskModalOpen,
    setSelectedTaskId
  } = useCrmStoreV2((state) => ({
    isTaskModalOpen: state.isTaskModalOpen,
    taskModalType: state.taskModalType,
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    setSelectedTaskId: state.setSelectedTaskId
  }));

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
