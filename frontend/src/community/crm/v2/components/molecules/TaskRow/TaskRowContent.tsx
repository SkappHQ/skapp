import { FC } from "react";

import {
  CrmContactEntity,
  CrmOwnerEntity,
  CrmTaskEntity,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  getTaskTypeIcon,
  getTaskTypeName
} from "~community/crm/v2/utils/taskUtil";

import TaskRowMeta from "./TaskRowMeta";
import TaskRowSubtitle from "./TaskRowSubtitle";

interface Props {
  task: CrmTaskEntity;
  owner?: CrmOwnerEntity;
  contact?: CrmContactEntity;
  taskTypes: CrmTaskTypeRecord;
  isShowContact: boolean;
  applyCompletedStyle: boolean;
}

const TaskRowContent: FC<Props> = ({
  task,
  owner,
  contact,
  taskTypes,
  isShowContact,
  applyCompletedStyle
}) => {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-4">
      <div
        className={`shrink-0 flex items-center justify-center ${applyCompletedStyle ? "opacity-40" : ""}`}
      >
        {getTaskTypeIcon(getTaskTypeName(task.typeId, taskTypes))}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`body2 leading-snug truncate ${applyCompletedStyle ? "line-through text-secondary-icon" : "text-black"}`}
        >
          {task.name}
        </p>

        <TaskRowSubtitle
          task={task}
          contact={contact}
          isShowContact={isShowContact}
          applyCompletedStyle={applyCompletedStyle}
        />
      </div>

      <TaskRowMeta
        task={task}
        owner={owner}
        applyCompletedStyle={applyCompletedStyle}
      />
    </div>
  );
};

export default TaskRowContent;
