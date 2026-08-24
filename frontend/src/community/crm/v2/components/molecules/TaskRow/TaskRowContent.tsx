import { FC } from "react";

import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getTaskTypeIcon } from "~community/crm/v2/utils/taskUtil";

import TaskRowMeta from "./TaskRowMeta";
import TaskRowSubtitle from "./TaskRowSubtitle";

interface TaskRowContentProps {
  task: CrmTaskEntity;
  typeName?: string;
  applyCompletedStyle: boolean;
}

const TaskRowContent: FC<TaskRowContentProps> = ({
  task,
  typeName,
  applyCompletedStyle
}) => {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-4">
      <div
        className={`shrink-0 flex items-center justify-center ${applyCompletedStyle ? "opacity-40" : ""}`}
      >
        {getTaskTypeIcon(typeName)}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${applyCompletedStyle ? "line-through text-secondary-icon" : "text-black"}`}
        >
          {task.name}
        </p>

        <TaskRowSubtitle
          task={task}
          applyCompletedStyle={applyCompletedStyle}
        />
      </div>

      <TaskRowMeta task={task} applyCompletedStyle={applyCompletedStyle} />
    </div>
  );
};

export default TaskRowContent;
