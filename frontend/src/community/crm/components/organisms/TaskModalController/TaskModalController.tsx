import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddTaskModal from "~community/crm/components/molecules/AddTaskModal/AddTaskModal";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const TaskModalController = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const { isTaskModalOpen, taskModalType, setIsTaskModalOpen } = useCrmStore(
    (store) => ({
      isTaskModalOpen: store.isTaskModalOpen,
      taskModalType: store.taskModalType,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    })
  );

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
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
      isOpen={isTaskModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(taskModalType)}
      content={getModalContent()}
    />
  );
};

export default TaskModalController;
