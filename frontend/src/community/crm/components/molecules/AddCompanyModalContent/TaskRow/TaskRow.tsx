import { FC } from "react";

import { CrmTaskType } from "~community/crm/types/CommonTypes";

import TaskRowButton from "./TaskRowButton";
import TaskRowCheckbox from "./TaskRowCheckbox";

interface Props {
  task: CrmTaskType;
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
  const applyCompletedStyle = task.isCompleted && isCheckTaskVisible;

  return (
    <div
      className={`relative flex items-center gap-4 p-3 min-w-0 ${className} min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden`}
    >
      {isCheckTaskVisible && <TaskRowCheckbox task={task} />}

      <TaskRowButton
        task={task}
        isShowContact={isShowContact}
        applyCompletedStyle={applyCompletedStyle}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default TaskRow;
