import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import SidePanelTasksEmptyView from "./SidePanelTasksEmptyView";
import SidePanelTasksList from "./SidePanelTasksList";

interface Props {
  tasks: CrmTaskDetailType[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onTaskRowClick?: () => void;
}

const SidePanelTasksSection: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick
}) => {
  const { setTaskModalType, setIsTaskModalOpen } = useCrmStore((store) => ({
    setTaskModalType: store.setTaskModalType,
    setIsTaskModalOpen: store.setIsTaskModalOpen
  }));

  const handleAddTask = () => {
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
