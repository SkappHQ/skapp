import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { getTaskTypeIcon } from "~community/crm/utils/taskUtil";

import TaskRowMeta from "./TaskRowMeta";
import TaskRowSubtitle from "./TaskRowSubtitle";

interface Props {
  task: CrmTaskDetailType;
  isShowContact: boolean;
  applyCompletedStyle: boolean;
}

const TaskRowContent: FC<Props> = ({
  task,
  isShowContact,
  applyCompletedStyle
}) => {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-4">
      <div
        className={`shrink-0 flex items-center justify-center ${applyCompletedStyle ? "opacity-40" : ""}`}
      >
        {getTaskTypeIcon(task.typeName)}
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
    </div>
  );
};

export default TaskRowContent;
