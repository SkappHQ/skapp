import { Avatar, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { CrmOwnerEntity, CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

interface Props {
  task: CrmTaskEntity;
  owner: CrmOwnerEntity | undefined;
  isCompletedStyleApplied: boolean;
}

const TaskRowMeta: FC<Props> = ({ task, owner, isCompletedStyleApplied }) => {
  const priorityConfig = getPriorityConfig(task.priority);
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
        id={`task-owner-${task.id}`}
        size="xs"
        src={imageUrl ?? undefined}
        firstName={owner?.firstName ?? ""}
        lastName={owner?.lastName}
      />
    </div>
  );
};

export default TaskRowMeta;
