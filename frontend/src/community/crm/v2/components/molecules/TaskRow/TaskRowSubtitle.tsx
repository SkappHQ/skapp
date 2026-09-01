import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { getDueDateStatus } from "~community/crm/v2/utils/taskUtil";

interface Props {
  taskId: number;
  isShowContact: boolean;
  isCompletedStyleApplied: boolean;
}

const TaskRowSubtitle: FC<Props> = ({
  taskId,
  isShowContact,
  isCompletedStyleApplied
}) => {
  const translateText = useTranslator("crmModule", "tasks", "table");

  const { tasks, contacts } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      contacts: store.contacts
    }))
  );

  const task = tasks[taskId];
  const contact = task?.contactId != null ? contacts[task.contactId] : undefined;

  const dueDateStatus = task?.dueAt
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
            date: dueDateStatus.dateValue ?? "",
            count: dueDateStatus.dayCount ?? 0
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
