import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import TaskRow from "../TaskRow/TaskRow";

interface TaskGroupProps {
  label: string;
  tasks: CrmTaskDetailType[];
}

const TaskGroup: FC<TaskGroupProps> = ({ label, tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="subtitle2 mb-2">{label}</div>
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-secondary-accent -mt-px first:mt-0 first:rounded-t-lg last:rounded-b-lg overflow-hidden"
          >
            <TaskRow task={task} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
