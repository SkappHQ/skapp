import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import TaskTypeIcon from "~community/crm/v2/components/atoms/TaskTypeIcon/TaskTypeIcon";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

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
  const { taskTypes, owners, contacts } = useCrmStoreV2(
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
    <div className="flex-1 min-w-0 flex items-center gap-4">
      <div
        className={`shrink-0 flex items-center justify-center ${isCompletedStyleApplied ? "opacity-40" : ""}`}
      >
        {typeName && <TaskTypeIcon typeName={typeName} size={20} />}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${isCompletedStyleApplied ? "line-through text-secondary-icon" : "text-black"}`}
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
