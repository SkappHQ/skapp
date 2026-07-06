import { FC } from "react";

import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";

import TaskRow from "../../molecules/TaskRow/TaskRow";

interface TaskGroupProps {
  label?: string;
  tasks: CrmTaskDetailType[];
  isCheckTaskVisible?: boolean;
}

const TaskGroup: FC<TaskGroupProps> = ({
  label,
  tasks,
  isCheckTaskVisible = true
}) => {
  const { setSelectedTaskId, openCrmSidePanel } = useCrmStore((store) => ({
    setSelectedTaskId: store.setSelectedTaskId,
    openCrmSidePanel: store.openCrmSidePanel
  }));

  return (
    <div className="flex flex-col">
      {label && (
        <div className="subtitle2 mb-2 sticky top-0 bg-white z-10">{label}</div>
      )}
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {tasks.map((task) => {
          return (
            <TaskRow
              key={task.id}
              task={task}
              isCheckTaskVisible={isCheckTaskVisible}
              isShowContact={true}
              onRowClick={() => {
                setSelectedTaskId(task.id);
                openCrmSidePanel(CrmSidePanelTypes.TASK_SIDE_PANEL);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TaskGroup;
