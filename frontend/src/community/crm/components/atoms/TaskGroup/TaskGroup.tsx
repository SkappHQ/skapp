import { FC } from "react";

import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

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
  const { setSelectedTaskId, setIsCrmSidePanelOpen } = useCrmStore((store) => ({
    setSelectedTaskId: store.setSelectedTaskId,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
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
                setIsCrmSidePanelOpen(true);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TaskGroup;
