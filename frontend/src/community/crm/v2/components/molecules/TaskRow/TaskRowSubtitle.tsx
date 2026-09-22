import { FC } from "react";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  CrmContactEntity,
  CrmTaskEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { getDueDateStatus } from "~community/crm/v2/utils/taskUtil";

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
  const translateText = useTranslator("crmModuleV2");

  const displayZone = useDisplayZone();

  const dueDateStatus = task.dueAt
    ? getDueDateStatus(task.dueAt, task.isCompleted === true, displayZone)
    : null;

  const isContactVisible = isShowContact && contact != null;
  const contactName = getContactDisplayName(contact);

  return (
    <div className="body3 leading-none mt-0.5 flex items-center gap-2">
      {dueDateStatus && (
        <span
          className={
            isCompletedStyleApplied
              ? "line-through text-secondary-icon"
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
          className="w-1 h-1 rounded-full bg-secondary-accent shrink-0"
        />
      )}

      {isContactVisible && (
        <span
          className={`min-w-0 truncate ${
            isCompletedStyleApplied
              ? "line-through text-secondary-icon"
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
