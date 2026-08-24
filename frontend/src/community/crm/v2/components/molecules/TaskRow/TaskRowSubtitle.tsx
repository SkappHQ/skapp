import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getDueDateStatus } from "~community/crm/v2/utils/taskUtil";

interface TaskRowSubtitleProps {
  task: CrmTaskEntity;
  applyCompletedStyle: boolean;
}

const TaskRowSubtitle: FC<TaskRowSubtitleProps> = ({
  task,
  applyCompletedStyle
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const dueDateStatus = getDueDateStatus(task.dueAt, task.isCompleted);

  return (
    <p className="body3 leading-none mt-0.5 flex items-center gap-2">
      {dueDateStatus && (
        <span
          className={
            applyCompletedStyle
              ? "line-through text-secondary-icon"
              : dueDateStatus.colorClass
          }
        >
          {translateText([dueDateStatus.textKey], {
            date: dueDateStatus.dateValue,
            count: dueDateStatus.dayCount
          })}
        </span>
      )}
    </p>
  );
};

export default TaskRowSubtitle;
