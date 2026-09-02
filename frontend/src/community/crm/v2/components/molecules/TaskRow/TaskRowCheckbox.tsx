import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

interface Props {
  taskId: number;
  isCompleted: boolean;
  onToggleComplete: (isCompleted: boolean) => void;
}

const TaskRowCheckbox: FC<Props> = ({
  taskId,
  isCompleted,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { tasks } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks
    }))
  );

  const task = tasks[taskId];

  return (
    <div className="shrink-0 flex items-center justify-center pr-1">
      <CheckTask
        checked={isCompleted}
        onChange={onToggleComplete}
        onClick={(e) => e.stopPropagation()}
        aria-label={translateText(
          [isCompleted ? "checkTaskMarkIncomplete" : "checkTaskMarkComplete"],
          { name: task.name }
        )}
      />
    </div>
  );
};

export default TaskRowCheckbox;
