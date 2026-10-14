import { FC } from "react";

import TaskRow from "~community/crm/components/molecules/TaskRow/TaskRow";
import { CrmTaskEntity } from "~community/crm/types/CrmCommonTypes";

interface Props {
  label?: string;
  tasks: CrmTaskEntity[];
  isCheckTaskVisible?: boolean;
  isShowContact?: boolean;
  onRowClick?: (taskId: number) => void;
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
      <div className="subtitle2 sticky top-0 z-10 mb-2 bg-white">{label}</div>
    )}
    <div className="divide-y divide-secondary-accent overflow-hidden rounded-lg border border-secondary-accent">
      {tasks.map(
        (task) =>
          task?.id && (
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
