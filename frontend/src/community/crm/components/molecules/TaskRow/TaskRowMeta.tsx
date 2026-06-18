import { Avatar, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { getPriorityConfig } from "~community/crm/utils/taskUtil";

interface Props {
  task: CrmTaskDetailType;
  applyCompletedStyle: boolean;
}

const TaskRowMeta: FC<Props> = ({ task, applyCompletedStyle }) => {
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div
      className={`flex items-center gap-6 shrink-0 ${applyCompletedStyle ? "opacity-40" : ""}`}
    >
      <PriorityIcon
        icon={priorityConfig.icon}
        bgColor={priorityConfig.bgColor}
      />

      <Avatar
        id={`task-owner-${task.id}`}
        size="xs"
        src={task.owner.authPic ?? undefined}
        firstName={task.owner.firstName}
        lastName={task.owner.lastName ?? undefined}
      />
    </div>
  );
};

export default TaskRowMeta;
