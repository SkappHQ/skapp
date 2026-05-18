import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import CompanyTask, {
  CompanyTaskData
} from "~community/crm/components/atoms/CompanyTask/CompanyTask";

interface Props {
  tasks: CompanyTaskData[];
  onToggleComplete: (id: string) => void;
  onAddTask: () => void;
}

const CompanyTasks: React.FC<Props> = ({
  tasks,
  onToggleComplete,
  onAddTask
}) => {
  return (
    <div className="flex flex-col pt-6">
      <h3 className="text-lg font-bold text-zinc-900">Tasks</h3>
      <div className="w-full h-px bg-zinc-200 my-3"></div>
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        {tasks.map((task) => (
          <CompanyTask
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onAddTask}
        className="flex items-center gap-2 mt-3 text-sm font-medium text-zinc-900 cursor-pointer hover:text-zinc-700"
      >
        Add task
        <Icon name={IconName.PLUS_ICON} width="1rem" height="1rem" />
      </button>
    </div>
  );
};

export default CompanyTasks;
