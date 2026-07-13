import { Avatar, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { TaskRowResponseType } from "~community/crm/types/CommonTypes";
import { getPriorityConfig } from "~community/crm/utils/taskUtil";

interface Props {
  task: TaskRowResponseType;
  applyCompletedStyle: boolean;
}

const TaskRowMeta: FC<Props> = ({ task, applyCompletedStyle }) => {
  const priorityConfig = getPriorityConfig(task.priority);
  const imageUrl = useGetImageUrl(task.owner.authPic ?? "");

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
        src={imageUrl}
        firstName={task.owner.firstName}
        lastName={task.owner.lastName ?? undefined}
      />
    </div>
  );
};

export default TaskRowMeta;
