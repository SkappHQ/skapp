import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface Props {
  task: CrmTaskEntity;
  isCompleted: boolean;
  onToggleComplete: (isCompleted: boolean) => void;
}

const TaskRowCheckbox: FC<Props> = ({
  task,
  isCompleted,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule", "tasks");

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
