import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmContactEntity, CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { getDueDateStatus } from "~community/crm/v2/utils/taskUtil";

interface Props {
  task: CrmTaskEntity;
  contact: CrmContactEntity | undefined;
  isShowContact: boolean;
  isCompletedStyleApplied: boolean;
}

const TaskRowSubtitle: FC<Props> = ({
  task,
  contact,
  isShowContact,
  isCompletedStyleApplied
}) => {
  const translateText = useTranslator("crmModule", "tasks", "table");

  const dueDateStatus = task.dueAt
    ? getDueDateStatus(task.dueAt, task.isCompleted === true)
    : null;

  return (
    <p className="body3 leading-none mt-0.5 flex items-center gap-2">
      {dueDateStatus && (
        <span
          className={
            isCompletedStyleApplied
              ? "line-through text-secondary-icon"
              : dueDateStatus.textColorClass
          }
        >
          {translateText([dueDateStatus.textKey], {
            date: dueDateStatus.dateValue,
            count: dueDateStatus.dayCount
          })}
        </span>
      )}

      {isShowContact && contact && dueDateStatus && (
        <span className="w-1 h-1 rounded-full bg-secondary-accent shrink-0" />
      )}

      {isShowContact && contact && (
        <span
          className={
            isCompletedStyleApplied
              ? "line-through text-secondary-icon"
              : "text-secondary-text"
          }
        >
          {getContactDisplayName(contact)}
        </span>
      )}
    </p>
  );
};

export default TaskRowSubtitle;
