import { FC } from "react";

import TaskRow from "~community/crm/v2/components/molecules/TaskRow/TaskRow";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface Props {
  label?: string;
  tasks: CrmTaskEntity[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onRowClick: (taskId: number) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

const TaskGroup: FC<Props> = ({
  label,
  tasks,
  isCheckTaskVisible = true,
  isShowContact = true,
  onRowClick,
  onToggleComplete
}) => (
  <div className="flex flex-col">
    {label && (
      <div className="subtitle2 mb-2 sticky top-0 bg-white z-10">{label}</div>
    )}
    <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
      {tasks.map(
        (task) =>
         task && task.id && (
            <TaskRow
              key={task.id}
              task={task}
              taskId={task.id}
              isCheckTaskVisible={isCheckTaskVisible}
              isShowContact={isShowContact}
              onRowClick={onRowClick}
              onToggleComplete={onToggleComplete}
            />
          )
      )}
    </div>
  </div>
);

export default TaskGroup;
