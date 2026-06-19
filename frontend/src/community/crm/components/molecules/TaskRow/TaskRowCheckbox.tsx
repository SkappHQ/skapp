import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTaskCompletion } from "~community/crm/api/TaskApi";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

interface Props {
  task: TaskRowResponseType;
}

const TaskRowCheckbox: FC<Props> = ({ task }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const { setToastMessage } = useToast();
  const { mutate: updateCompletion } = useUpdateTaskCompletion(
    () => {},
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toggleErrorTitle"]),
        description: translateText(["toggleErrorDescription"])
      });
    }
  );

  const handleToggleChange = (checked: boolean) => {
    updateCompletion({ id: task.id, isCompleted: checked });
  };

  return (
    <div
      className="shrink-0 flex items-center justify-center pr-1"
      onClick={(e) => e.stopPropagation()}
    >
      <CheckTask
        checked={task.isCompleted}
        onChange={handleToggleChange}
        aria-label={translateText(
          [
            task.isCompleted
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
