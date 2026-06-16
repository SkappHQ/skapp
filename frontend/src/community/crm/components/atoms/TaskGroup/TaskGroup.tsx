import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

// import TaskRow from "../TaskRow/TaskRow";

// TODO: Replace with the real TaskRow component once implemented
const TaskRow: FC<{ task: CrmTaskDetailType }> = ({ task }) => (
  <div>{task.id}</div>
);

interface TaskGroupProps {
  label: string;
  tasks: CrmTaskDetailType[];
}

const TaskGroup: FC<TaskGroupProps> = ({ label, tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="subtitle2 mb-2 sticky top-0 bg-white">{label}</div>
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {tasks.map((task) => (
          <div key={task.id}>
            <TaskRow task={task} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskGroup;
