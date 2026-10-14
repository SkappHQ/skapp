import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskEntity } from "~community/crm/types/CrmCommonTypes";

import TaskRowCheckbox from "./TaskRowCheckbox";
import TaskRowContent from "./TaskRowContent";

interface Props {
  task: CrmTaskEntity;
  taskId: number;
  onRowClick?: (taskId: number) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  isShowContact?: boolean;
  isCheckTaskVisible?: boolean;
}

const TaskRow: FC<Props> = ({
  task,
  taskId,
  onRowClick,
  onToggleComplete,
  isShowContact = false,
  isCheckTaskVisible = true
}) => {
  const translateAria = useTranslator("crmAria");

  const isCompleted = task.isCompleted === true;
  const isCompletedStyleApplied = isCompleted && isCheckTaskVisible;

  const handleToggleComplete = (completed: boolean) => {
    onToggleComplete(taskId, completed);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={translateAria(["tasks", "row", "openTaskDetails"], {
        name: task.name
      })}
      className="relative flex min-h-[63px] min-w-0 cursor-pointer items-center gap-4 overflow-hidden bg-white p-3 hover:bg-secondary-background"
      onClick={() => onRowClick?.(taskId)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onRowClick?.(taskId);
      }}
    >
      {isCheckTaskVisible && (
        <TaskRowCheckbox
          task={task}
          isCompleted={isCompleted}
          onToggleComplete={handleToggleComplete}
        />
      )}

      <TaskRowContent
        task={task}
        isShowContact={isShowContact}
        isCompletedStyleApplied={isCompletedStyleApplied}
      />
    </div>
  );
};

export default TaskRow;
