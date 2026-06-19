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
  preselectedContactName?: string;
}

const SidePanelTasksSection: FC<Props> = ({
  tasks,
  isCheckTaskVisible,
  isShowContact,
  onTaskRowClick,
  preselectedContactName
}) => {
  const { setIsTaskModalOpen, setTaskModalType, setPreselectedContactName } =
    useCrmStore((store) => ({
      setIsTaskModalOpen: store.setIsTaskModalOpen,
      setTaskModalType: store.setTaskModalType,
      setPreselectedContactName: store.setPreselectedContactName
    }));

  const handleAddTask = () => {
    setPreselectedContactName(preselectedContactName ?? null);
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
