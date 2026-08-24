import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddTaskModalContent from "~community/crm/v2/components/molecules/AddTaskModalContent/AddTaskModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";

const TaskModalController: FC = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const {
    isTaskModalOpen,
    taskModalType,
    setIsTaskModalOpen,
    setSelectedTaskId
  } = useCrmStoreV2(
    useShallow((store) => ({
      isTaskModalOpen: store.isTaskModalOpen,
      taskModalType: store.taskModalType,
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setSelectedTaskId: store.setSelectedTaskId
    }))
  );

  const handleCloseModal = () => {
    setSelectedTaskId(null);
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
        return <AddTaskModalContent />;
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
