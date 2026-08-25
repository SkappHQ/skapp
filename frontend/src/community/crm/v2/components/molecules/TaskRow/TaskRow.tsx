import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getTaskTypeName, updateTask } from "~community/crm/v2/utils/taskUtil";

import TaskRowCheckbox from "./TaskRowCheckbox";
import TaskRowContent from "./TaskRowContent";

interface TaskRowProps {
  taskId: number;
  onRowClick?: () => void;
  isCheckTaskVisible?: boolean;
}

const TaskRow: FC<TaskRowProps> = ({
  taskId,
  onRowClick,
  isCheckTaskVisible = true
}) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const { tasks, taskTypes, setTasks } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      taskTypes: store.taskTypes,
      setTasks: store.setTasks
    }))
  );

  const task = tasks[taskId];

  const isCompleted = Boolean(task.isCompleted);

  const applyCompletedStyle = isCompleted && isCheckTaskVisible;

  const handleToggleError = (wasCompleted: boolean) => {
    setTasks(updateTask(tasks, taskId, { isCompleted: wasCompleted }));
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  };

  const { mutate: updateCompletion } = useUpdateTask((updatedTask) =>
    setTasks(updateTask(tasks, taskId, updatedTask))
  );

  const handleToggleChange = (nextIsCompleted: boolean) => {
    const wasCompleted = isCompleted;

    setTasks(updateTask(tasks, taskId, { isCompleted: nextIsCompleted }));

    updateCompletion(
      { id: taskId, payload: { isCompleted: nextIsCompleted } },
      { onError: () => handleToggleError(wasCompleted) }
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={translateText(["openTaskDetails"], { name: task.name })}
      className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden cursor-pointer"
      onClick={onRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onRowClick?.();
      }}
    >
      {isCheckTaskVisible && (
        <TaskRowCheckbox
          task={task}
          isCompleted={isCompleted}
          handleToggleChange={handleToggleChange}
        />
      )}

      <TaskRowContent
        task={task}
        typeName={getTaskTypeName(taskTypes, task.typeId)}
        applyCompletedStyle={applyCompletedStyle}
      />
    </div>
  );
};

export default TaskRow;
