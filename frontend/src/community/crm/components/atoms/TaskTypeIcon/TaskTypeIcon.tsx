import { ChecklistVerificationFilledIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { TASK_TYPE_ICON_MAP } from "~community/crm/constants/taskConstants";

interface Props {
  typeName: string;
  size?: number;
}

const TaskTypeIcon: FC<Props> = ({ typeName, size = 20 }) => {
  const Icon =
    TASK_TYPE_ICON_MAP[typeName.toLowerCase()] ??
    ChecklistVerificationFilledIcon;

  return <Icon width={size} height={size} />;
};

export default TaskTypeIcon;
