import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

import TaskRowCheckbox from "./TaskRowCheckbox";
import TaskRowContent from "./TaskRowContent";

interface Props {
  taskId: number;
  onRowClick?: () => void;
  isShowContact?: boolean;
  isCheckTaskVisible?: boolean;
  className?: string;
}

const TaskRow: FC<Props> = ({
  taskId,
  onRowClick,
  isShowContact = false,
  isCheckTaskVisible = true,
  className
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const task = useCrmStoreV2((state) => state.tasks[taskId]);
  const setTasks = useCrmStoreV2((state) => state.setTasks);

  const { mutate: updateCompletion } = useUpdateTask();

  /**
   * There is a single task record, so flipping the flag here updates every view
   * that renders this task. The call site builds the next record and the setter
   * assigns it.
   */
  const applyCompletion = (isCompleted: boolean) => {
    const { tasks } = useCrmStoreV2.getState();
    setTasks({ ...tasks, [taskId]: { ...tasks[taskId], isCompleted } });
  };

  const handleToggleChange = (isCompleted: boolean) => {
    const wasCompleted = task?.isCompleted ?? false;

    applyCompletion(isCompleted);

    updateCompletion(
      { id: taskId, isCompleted },
      {
        onError: () => {
          applyCompletion(wasCompleted);
          setToastMessage({
            open: true,
            toastType: ToastType.ERROR,
            title: translateText(["toggleErrorTitle"]),
            description: translateText(["toggleErrorDescription"])
          });
        }
      }
    );
  };

  if (!task) return null;

  const isCompleted = task.isCompleted ?? false;
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
