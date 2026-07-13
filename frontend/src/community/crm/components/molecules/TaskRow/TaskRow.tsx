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

  const [isChecked, setIsChecked] = useState(task.isCompleted);

  useEffect(() => {
    setIsChecked(task.isCompleted);
  }, [task.isCompleted]);

  const { mutate: updateCompletion } = useUpdateTask();

  const syncContactTaskCompletion = (isCompleted: boolean) => {
    if (task.contact) {
      updateContactTaskCompletion(task.contact.id, task.id, isCompleted);
    }
  };

  const handleToggleError = (wasChecked: boolean) => {
    setIsChecked(wasChecked);
    syncContactTaskCompletion(wasChecked);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toggleErrorTitle"]),
      description: translateText(["toggleErrorDescription"])
    });
  };

  const handleToggleChange = (isChecked: boolean) => {
    const wasChecked = task.isCompleted;

    setIsChecked(isChecked);
    syncContactTaskCompletion(isChecked);

    updateCompletion(
      { id: task.id, isCompleted: isChecked },
      {
        onError: () => handleToggleError(wasChecked)
      }
    );
  };

  const applyCompletedStyle = isChecked && isCheckTaskVisible;

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
          isChecked={isChecked}
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
