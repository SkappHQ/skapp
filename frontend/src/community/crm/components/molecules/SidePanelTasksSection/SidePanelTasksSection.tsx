import { FC } from "react";

import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import SidePanelTasksEmptyView from "./SidePanelTasksEmptyView";
import SidePanelTasksList from "./SidePanelTasksList";

interface Props {
  tasks: CrmTaskType[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
  preselectedContact?: { id: number; name: string } | null;
}

const SidePanelTasksSection: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  preselectedContact
}) => {
  const { setIsTaskModalOpen, setTaskModalType, setPreselectedContact } =
    useCrmStore((store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType,
      setPreselectedContact: store.setPreselectedContact
    }));

  const handleAddTask = () => {
    setPreselectedContact(preselectedContact ?? null);
    setTaskModalType(CrmModalTypes.ADD_TASK_MODAL);
    setIsTaskModalOpen(true);
  };

  return tasks.length > 0 ? (
    <SidePanelTasksList
      tasks={tasks}
      isCheckTaskVisible={isCheckTaskVisible}
      isShowContact={isShowContact}
      onTaskRowClick={onTaskRowClick}
      onAddTask={handleAddTask}
    />
  ) : (
    <SidePanelTasksEmptyView onAddTask={handleAddTask} />
  );
};

export default SidePanelTasksSection;
