import { PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import OwnerAvatar from "~community/crm/v2/components/atoms/OwnerAvatar/OwnerAvatar";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOwnerById } from "~community/crm/v2/utils/commonUtil";
import { getPriorityConfig } from "~community/crm/v2/utils/taskUtil";

interface TaskRowMetaProps {
  task: CrmTaskEntity;
  applyCompletedStyle: boolean;
}

const TaskRowMeta: FC<TaskRowMetaProps> = ({ task, applyCompletedStyle }) => {
  const owners = useCrmStoreV2((store) => store.owners);

  const priorityConfig = getPriorityConfig(task.priority);

  const owner = getOwnerById(owners, task.ownerId);

  return (
    <div
      className={`flex items-center gap-6 shrink-0 ${applyCompletedStyle ? "opacity-40" : ""}`}
    >
      {priorityConfig && (
        <PriorityIcon
          icon={priorityConfig.icon}
          bgColor={priorityConfig.bgColor}
        />
      )}

      {owner !== undefined && (
        <OwnerAvatar id={`task-owner-${task.id}`} owner={owner} size="xs" />
      )}
    </div>
  );
};

export default TaskRowMeta;
