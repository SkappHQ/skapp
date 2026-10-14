import { FC } from "react";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  CrmContactEntity,
  CrmTaskEntity
} from "~community/crm/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";
import { getDueDateStatus } from "~community/crm/utils/taskUtil";

interface Props {
  task: CrmTaskEntity;
  contact?: CrmContactEntity;
  isShowContact: boolean;
  isCompletedStyleApplied: boolean;
}

const TaskRowSubtitle: FC<Props> = ({
  task,
  contact,
  isShowContact,
  isCompletedStyleApplied
}) => {
  const translateText = useTranslator("crmModule");

  const displayZone = useDisplayZone();

  const dueDateStatus = task.dueAt
    ? getDueDateStatus(task.dueAt, task.isCompleted === true, displayZone)
    : null;

  const isContactVisible = isShowContact && contact != null;
  const contactName = getContactDisplayName(contact);

  return (
    <div className="body3 mt-0.5 flex items-center gap-2 leading-none">
      {dueDateStatus && (
        <span
          className={
            isCompletedStyleApplied
              ? "text-secondary-icon line-through"
              : dueDateStatus.textColorClass
          }
        >
          {translateText(
            ["tasks", "table", "dueDateStatus", dueDateStatus.textKey],
            {
              date: dueDateStatus.dateValue,
              count: dueDateStatus.dayCount
            }
          )}
        </span>
      )}

      {dueDateStatus && isContactVisible && (
        <span
          aria-hidden="true"
          className="h-1 w-1 shrink-0 rounded-full bg-secondary-accent"
        />
      )}

      {isContactVisible && (
        <span
          className={`min-w-0 truncate ${
            isCompletedStyleApplied
              ? "text-secondary-icon line-through"
              : "text-secondary-text"
          }`}
          title={contactName}
        >
          {contactName}
        </span>
      )}
    </div>
  );
};

export default TaskRowSubtitle;
