import { FC } from "react";

import { TASK_TYPE_ICON_MAP } from "~community/crm/v2/constants/taskConstants";

interface Props {
  typeName?: string;
  size?: number;
}

const TaskTypeIcon: FC<Props> = ({ typeName, size = 20 }) => {
  const Icon =
    TASK_TYPE_ICON_MAP[typeName?.toLowerCase() ?? ""] ?? TASK_TYPE_ICON_MAP.other;

  return <Icon width={size} height={size} />;
};

export default TaskTypeIcon;
