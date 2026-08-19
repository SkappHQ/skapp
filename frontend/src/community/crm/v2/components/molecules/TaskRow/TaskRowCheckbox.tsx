import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface Props {
  task: CrmTaskEntity;
  handleToggleChange: (isCompleted: boolean) => void;
  isCompleted: boolean;
}

const TaskRowCheckbox: FC<Props> = ({
  task,
  handleToggleChange,
  isCompleted
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  return (
    <div
      className="shrink-0 flex items-center justify-center pr-1"
      onClick={(e) => e.stopPropagation()}
    >
      <CheckTask
        checked={isCompleted}
        onChange={handleToggleChange}
        aria-label={translateText(
          [isCompleted ? "checkTaskMarkIncomplete" : "checkTaskMarkComplete"],
          { name: task.name }
        )}
      />
    </div>
  );
};

export default TaskRowCheckbox;
