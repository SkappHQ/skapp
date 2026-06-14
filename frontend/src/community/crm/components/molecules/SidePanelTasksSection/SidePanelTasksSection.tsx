import { FC } from "react";

import { CrmTaskType } from "~community/crm/types/CommonTypes";

import SidePanelTasksEmpty from "./SidePanelTasksEmpty";
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
    <SidePanelTasksEmpty onAddTask={handleAddTask} />
  );
};

export default SidePanelTasksSection;
