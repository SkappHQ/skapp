import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  getDueDateStatus,
  getSelectedTask,
  getTaskContact
} from "~community/crm/v2/utils/taskUtil";

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
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  const { tasks, contacts } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      contacts: store.contacts
    }))
  );

  const task = getSelectedTask(tasks, taskId);
  const contact = getTaskContact(contacts, task?.contactId);

  const dueDateStatus = getDueDateStatus(task?.dueAt, task?.isCompleted);

  return (
    <p className="body3 leading-none mt-0.5 flex items-center gap-2">
      {dueDateStatus && (
        <span
          className={
            isCompletedStyleApplied
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
              isCompletedStyleApplied
                ? "line-through text-secondary-icon"
                : "text-secondary-text"
            }
          >
            {contact?.name}
          </span>
        </>
      )}
    </p>
  );
};

export default TaskRowSubtitle;
