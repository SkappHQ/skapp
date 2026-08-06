import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";
import { getContactFullName } from "~community/crm/utils/contactUtil";
import { getDueDateStatus } from "~community/crm/utils/taskUtil";

interface Props {
  task: TaskRowResponseType;
  isShowContact: boolean;
  applyCompletedStyle: boolean;
}

const TaskRowSubtitle: FC<Props> = ({
  task,
  isShowContact,
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
            date: dueDateStatus.dateValue ?? "",
            count: dueDateStatus.dayCount ?? 0
          })}
        </span>
      )}

      {isShowContact && (
        <>
          <span className="w-1 h-1 rounded-full bg-secondary-accent shrink-0" />
          <span
            className={
              applyCompletedStyle
                ? "line-through text-secondary-icon"
                : "text-secondary-text"
            }
          >
            {getContactFullName(task.contact)}
          </span>
        </>
      )}
    </p>
  );
};

export default TaskRowSubtitle;
