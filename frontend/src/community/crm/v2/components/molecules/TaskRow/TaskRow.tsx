import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getSelectedTask, mergeTasks } from "~community/crm/v2/utils/taskUtil";

import TaskRowCheckbox from "./TaskRowCheckbox";
import TaskRowContent from "./TaskRowContent";
import TaskRowSkeleton from "./TaskRowSkeleton";

interface Props {
  taskId: number;
  onRowClick?: () => void;
  isShowContact?: boolean;
  isCheckTaskVisible?: boolean;
}

const TaskRow: FC<Props> = ({
  taskId,
  onRowClick,
  isShowContact = false,
  isCheckTaskVisible = true
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const { tasks, setTasks } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      setTasks: store.setTasks
    }))
  );

  const task = getSelectedTask(tasks, taskId);

  const { mutate: updateCompletion } = useUpdateTask();

  if (!task) return <TaskRowSkeleton />;

  const isCompleted = task.isCompleted === true;
  const isCompletedStyleApplied = isCompleted && isCheckTaskVisible;

  const applyCompletion = (completed: boolean) => {
    setTasks(mergeTasks(tasks, [{ id: taskId, isCompleted: completed }]));
  };

  const handleToggleComplete = (completed: boolean) => {
    applyCompletion(completed);

    updateCompletion(
      { id: taskId, task: { isCompleted: completed } },
      {
        onError: () => {
          applyCompletion(isCompleted);
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

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={translateText(["openTaskDetails"], { name: task.name })}
      className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden cursor-pointer"
      onClick={onRowClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onRowClick?.();
      }}
    >
      {isCheckTaskVisible && (
        <TaskRowCheckbox
          taskId={taskId}
          isCompleted={isCompleted}
          onToggleComplete={handleToggleComplete}
        />
      )}

      <TaskRowContent
        taskId={taskId}
        isShowContact={isShowContact}
        isCompletedStyleApplied={isCompletedStyleApplied}
      />
    </div>
  );
};

export default TaskRow;
