import { FC } from "react";

import { CrmTaskType } from "~community/crm/types/CommonTypes";

import SidePanelTasksEmptyView from "./SidePanelTasksEmptyView";
import SidePanelTasksList from "./SidePanelTasksList";

interface Props {
  tasks: CrmTaskType[];
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
  const handleAddTask = () => {
    // TODO: open add task modal (wire up to CRM store)
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