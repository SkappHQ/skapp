import { FC, useEffect, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateTask } from "~community/crm/api/TaskApi";
import { useCrmStore } from "~community/crm/store/store";
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

  const { updateContactTaskCompletion } = useCrmStore((store) => ({
    updateContactTaskCompletion: store.updateContactTaskCompletion
  }));

  const [taskCompleted, setTaskCompleted] = useState(task.isCompleted);

  useEffect(() => {
    setTaskCompleted(task.isCompleted);
  }, [task.isCompleted]);

  const handleUpdateCompletionError = () => {
    setTaskCompleted(task.isCompleted);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  };

  const { mutate: updateCompletion } = useUpdateTask();

  const handleUpdateCompletionSuccess = (checked: boolean) => {
    if (task.contact) {
      updateContactTaskCompletion({
        contactId: task.contact.id,
        taskId: task.id,
        isCompleted: checked
      });
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setTaskCompleted(checked);
    updateCompletion(
      { id: task.id, isCompleted: checked },
      {
        onSuccess: () => handleUpdateCompletionSuccess(checked),
        onError: handleUpdateCompletionError
      }
    );
  };

  const applyCompletedStyle = taskCompleted && isCheckTaskVisible;

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
          isTaskCompleted={taskCompleted}
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
