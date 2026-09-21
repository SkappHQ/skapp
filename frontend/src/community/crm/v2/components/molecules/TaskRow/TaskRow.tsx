import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

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
  const translateText = useTranslator("crmModule", "tasks");

  const isCompleted = task.isCompleted === true;
  const isCompletedStyleApplied = isCompleted && isCheckTaskVisible;

  const handleToggleComplete = (completed: boolean) => {
    onToggleComplete(taskId, completed);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={translateText(["openTaskDetails"], { name: task.name })}
      className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden cursor-pointer"
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
