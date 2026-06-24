import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

interface Props {
  task: TaskRowResponseType;
  handleToggleChange: (checked: boolean) => void;
  isTaskCompleted: boolean;
}

const TaskRowCheckbox: FC<Props> = ({
  task,
  handleToggleChange,
  isTaskCompleted
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  return (
    <div
      className="shrink-0 flex items-center justify-center pr-1"
      onClick={(e) => e.stopPropagation()}
    >
      <CheckTask
        checked={isTaskCompleted}
        onChange={handleToggleChange}
        aria-label={translateText(
          [
            isTaskCompleted
              ? "checkTaskMarkIncomplete"
              : "checkTaskMarkComplete"
          ],
          { name: task.name }
        )}
      />
    </div>
  );
};

export default TaskRowCheckbox;
