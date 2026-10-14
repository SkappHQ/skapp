import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import TaskTypeIcon from "~community/crm/components/atoms/TaskTypeIcon/TaskTypeIcon";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskEntity } from "~community/crm/types/CrmCommonTypes";

import TaskRowMeta from "./TaskRowMeta";
import TaskRowSubtitle from "./TaskRowSubtitle";

interface Props {
  task: CrmTaskEntity;
  isShowContact: boolean;
  isCompletedStyleApplied: boolean;
}

const TaskRowContent: FC<Props> = ({
  task,
  isShowContact,
  isCompletedStyleApplied
}) => {
  const { taskTypes, owners, contacts } = useCrmStore(
    useShallow((store) => ({
      taskTypes: store.taskTypes,
      owners: store.owners,
      contacts: store.contacts
    }))
  );

  const typeName =
    task.typeId != null ? taskTypes[task.typeId]?.name : undefined;
  const owner = task.ownerId != null ? owners[task.ownerId] : undefined;
  const contact = task.contactId != null ? contacts[task.contactId] : undefined;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div
        className={`flex shrink-0 items-center justify-center ${isCompletedStyleApplied ? "opacity-40" : ""}`}
      >
        {typeName && <TaskTypeIcon typeName={typeName} size={20} />}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`body2 truncate leading-snug ${isCompletedStyleApplied ? "text-secondary-icon line-through" : "text-black"}`}
          title={task.name}
        >
          {task.name}
        </p>

        <TaskRowSubtitle
          task={task}
          contact={contact}
          isShowContact={isShowContact}
          isCompletedStyleApplied={isCompletedStyleApplied}
        />
      </div>

      <TaskRowMeta
        task={task}
        owner={owner}
        isCompletedStyleApplied={isCompletedStyleApplied}
      />
    </div>
  );
};

export default TaskRowContent;
