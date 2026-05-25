import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddTaskModal from "~community/crm/components/molecules/AddTaskModal/AddTaskModal";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const TaskModalController = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const { isAddTaskModalOpen, taskModalType, setIsAddTaskModalOpen } =
    useCrmStore((store) => ({
      isAddTaskModalOpen: store.isAddTaskModalOpen,
      taskModalType: store.taskModalType,
      setIsAddTaskModalOpen: store.setIsAddTaskModalOpen
    }));

  const handleCloseModal = (): void => {
    setIsAddTaskModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes): string => {
    switch (modalType) {
      case CrmModalTypes.ADD_TASK_MODAL:
        return translateText(["addTaskModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (taskModalType) {
      case CrmModalTypes.ADD_TASK_MODAL:
        return <AddTaskModal />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isAddTaskModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(taskModalType)}
      content={getModalContent()}
    />
  );
};

export default TaskModalController;
