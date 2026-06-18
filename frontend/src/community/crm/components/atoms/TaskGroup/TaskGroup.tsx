import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

// import TaskRow from "../TaskRow/TaskRow";

interface TaskGroupProps {
  label: string;
  tasks: CrmTaskDetailType[];
  isCompletedTasks?: boolean;
}

const TaskGroup: FC<TaskGroupProps> = ({ label, tasks, isCompletedTasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="subtitle2 mb-2 sticky top-0 bg-white z-10">{label}</div>
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {tasks.map((task) => (
          <div key={task.id}>{/* <TaskRow task={task} /> */}</div>
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
