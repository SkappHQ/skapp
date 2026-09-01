import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import TaskTypeIcon from "~community/crm/v2/components/atoms/TaskTypeIcon/TaskTypeIcon";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

import TaskRowMeta from "./TaskRowMeta";
import TaskRowSubtitle from "./TaskRowSubtitle";

interface Props {
  taskId: number;
  isShowContact: boolean;
  isCompletedStyleApplied: boolean;
}

const TaskRowContent: FC<Props> = ({
  taskId,
  isShowContact,
  isCompletedStyleApplied
}) => {
  const { tasks, taskTypes } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      taskTypes: store.taskTypes
    }))
  );

  const task = tasks[taskId];
  const typeName =
    task?.typeId != null ? taskTypes[task.typeId]?.name : undefined;

  return (
    <div className="flex-1 min-w-0 flex items-center gap-4">
      <div
        className={`shrink-0 flex items-center justify-center ${isCompletedStyleApplied ? "opacity-40" : ""}`}
      >
        <TaskTypeIcon typeName={typeName} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${isCompletedStyleApplied ? "line-through text-secondary-icon" : "text-black"}`}
        >
          {task?.name}
        </p>

        <TaskRowSubtitle
          taskId={taskId}
          isShowContact={isShowContact}
          isCompletedStyleApplied={isCompletedStyleApplied}
        />
      </div>

      <TaskRowMeta
        taskId={taskId}
        isCompletedStyleApplied={isCompletedStyleApplied}
      />
    </div>
  );
};

export default TaskRowContent;
