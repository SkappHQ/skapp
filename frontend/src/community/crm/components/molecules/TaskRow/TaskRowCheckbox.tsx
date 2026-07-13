import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

interface Props {
  task: TaskRowResponseType;
  handleToggleChange: (isChecked: boolean) => void;
  isChecked: boolean;
}

const TaskRowCheckbox: FC<Props> = ({
  task,
  handleToggleChange,
  isChecked
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  return (
    <div
      className="shrink-0 flex items-center justify-center pr-1"
      onClick={(e) => e.stopPropagation()}
    >
      <CheckTask
        checked={isChecked}
        onChange={handleToggleChange}
        aria-label={translateText(
          [isChecked ? "checkTaskMarkIncomplete" : "checkTaskMarkComplete"],
          { name: task.name }
        )}
      />
    </div>
  );
};

export default TaskRowCheckbox;
