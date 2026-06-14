import { FC } from "react";

import { CrmTaskType } from "~community/crm/types/CommonTypes";
import { getTaskTypeIcon } from "~community/crm/utils/taskUtil";

import TaskRowMeta from "./TaskRowMeta";
import TaskRowSubtitle from "./TaskRowSubtitle";

interface Props {
  task: CrmTaskType;
  isShowContact: boolean;
  applyCompletedStyle: boolean;
  onRowClick?: () => void;
}

const TaskRowButton: FC<Props> = ({
  task,
  isShowContact,
  applyCompletedStyle,
  onRowClick
}) => {
  return (
    <button
      type="button"
      className="flex-1 min-w-0 flex items-center gap-4 text-left border-0 bg-transparent p-0 cursor-pointer focus:outline-none"
      onClick={onRowClick}
    >
      <div
        className={`shrink-0 flex items-center justify-center ${applyCompletedStyle ? "opacity-40" : ""}`}
      >
        {getTaskTypeIcon(task.type.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${applyCompletedStyle ? "line-through text-secondary-icon" : "text-black"}`}
        >
          {task.name}
        </p>

        <TaskRowSubtitle
          task={task}
          isShowContact={isShowContact}
          applyCompletedStyle={applyCompletedStyle}
        />
      </div>

      <TaskRowMeta task={task} applyCompletedStyle={applyCompletedStyle} />
    </button>
  );
};

export default TaskRowButton;
