import { Avatar, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";
import {
  getSelectedTask,
  getTaskOwner
} from "~community/crm/v2/utils/taskUtil";

interface Props {
  taskId: number;
  isCompletedStyleApplied: boolean;
}

const TaskRowMeta: FC<Props> = ({ taskId, isCompletedStyleApplied }) => {
  const { tasks, owners } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      owners: store.owners
    }))
  );

  const task = getSelectedTask(tasks, taskId);
  const owner = getTaskOwner(owners, task?.ownerId);

  const priorityConfig = getPriorityConfig(task?.priority);
  const imageUrl = useGetImageUrl(owner?.authPic ?? "");

  return (
    <div
      className={`flex items-center gap-6 shrink-0 ${isCompletedStyleApplied ? "opacity-40" : ""}`}
    >
      <PriorityIcon
        icon={priorityConfig.icon}
        bgColor={priorityConfig.bgColor}
      />

      <Avatar
        id={`task-owner-${taskId}`}
        size="xs"
        src={imageUrl ?? undefined}
        firstName={owner?.firstName ?? ""}
        lastName={owner?.lastName}
      />
    </div>
  );
};

export default TaskRowMeta;
