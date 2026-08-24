import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/v2/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  mergeTasks,
  resolveTaskRelations
} from "~community/crm/v2/utils/taskUtil";

import TaskRowCheckbox from "./TaskRowCheckbox";
import TaskRowContent from "./TaskRowContent";

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

  const { task, tasks, owners, contacts, taskTypes, setTasks } = useCrmStoreV2(
    useShallow((store) => ({
      task: store.tasks[taskId],
      tasks: store.tasks,
      owners: store.owners,
      contacts: store.contacts,
      taskTypes: store.taskTypes,
      setTasks: store.setTasks
    }))
  );

  const { owner, contact } = useMemo(
    () => resolveTaskRelations(task, owners, contacts),
    [task, owners, contacts]
  );

  const { mutate: updateCompletion } = useUpdateTask();

  const applyCompletion = (isCompleted: boolean) => {
    setTasks(mergeTasks(tasks, [{ id: taskId, isCompleted }]));
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
      className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden cursor-pointer"
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
        owner={owner}
        contact={contact}
        taskTypes={taskTypes}
        isShowContact={isShowContact}
        applyCompletedStyle={applyCompletedStyle}
      />
    </div>
  );
};

export default TaskRow;
