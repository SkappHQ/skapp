import { FC, useEffect, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/api/TaskApi";
import { useSyncTaskCompletion } from "~community/crm/hooks/useSyncTaskCompletion";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";

import TaskRowCheckbox from "./TaskRowCheckbox";
import TaskRowContent from "./TaskRowContent";

interface Props {
  task: TaskRowResponseType;
  onRowClick?: () => void;
  isShowContact?: boolean;
  isCheckTaskVisible?: boolean;
  className?: string;
}

const TaskRow: FC<Props> = ({
  task,
  onRowClick,
  isShowContact = false,
  isCheckTaskVisible = true,
  className
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const syncTaskCompletion = useSyncTaskCompletion();

  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

  useEffect(() => {
    setIsCompleted(task.isCompleted);
  }, [task.isCompleted]);

  const { mutate: updateCompletion } = useUpdateTask();

  const handleToggleError = (previousCompleted: boolean) => {
    setIsCompleted(previousCompleted);
    syncTaskCompletion(task, previousCompleted);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  };

  const handleToggleChange = (isCompleted: boolean) => {
    const previousCompleted = task.isCompleted;

    setIsCompleted(isCompleted);
    syncTaskCompletion(task, isCompleted);

    updateCompletion(
      { id: task.id, isCompleted },
      {
        onError: () => handleToggleError(previousCompleted)
      }
    );
  };

  const applyCompletedStyle = isCompleted && isCheckTaskVisible;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={translateText(["openTaskDetails"], { name: task.name })}
      className={`relative flex items-center gap-4 p-3 min-w-0 ${className} min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden cursor-pointer`}
      onClick={onRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onRowClick?.();
      }}
    >
      {isCheckTaskVisible && (
        <TaskRowCheckbox
          task={task}
          handleToggleChange={handleToggleChange}
          isCompleted={isCompleted}
        />
      )}

      <TaskRowContent
        task={task}
        isShowContact={isShowContact}
        applyCompletedStyle={applyCompletedStyle}
      />
    </div>
  );
};

export default TaskRow;
